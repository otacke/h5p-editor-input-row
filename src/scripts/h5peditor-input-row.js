/** Class for InputRow H5P widget */
class InputRow extends H5P.EventDispatcher {

  /**
   * @class
   * @param {object} parent Parent element in semantics.
   * @param {object} field Semantics field properties.
   * @param {object} params Parameters entered in editor form.
   * @param {function} setValue Callback to set parameters.
   */
  constructor(parent, field, params, setValue) {
    super();

    this.parent = parent;
    this.field = field;
    this.params = params || {};
    this.setValue = setValue;

    this.field.inputrow = this.field.inputrow || {};

    // Callbacks to call when parameters change
    this.changes = [];

    // Let parent handle ready callbacks of children
    this.passReadies = true;

    // Container
    this.$container = H5P.jQuery('<fieldset>', {
      class: `field group field-name-${this.field.name} h5peditor-input-row expanded`,
    });

    // Title
    const title = document.createElement('div');
    title.classList.add('title');
    title.innerText = this.field.label;
    this.$container.get(0).appendChild(title);

    // Content
    const content = document.createElement('div');
    content.classList.add('h5peditor-input-row-content');
    this.$container.get(0).appendChild(content);

    // Description
    if (this.field.description) {
      const description = document.createElement('div');
      description.classList.add('h5peditor-field-description');
      description.innerText = this.field.description;
      content.appendChild(description);
    }

    // Row
    const row = document.createElement('div');
    row.classList.add('h5peditor-input-row-row');
    content.appendChild(row);

    // Errors field
    this.$errors = H5P.jQuery('<div>', {
      class: 'h5p-errors',
    });
    content.appendChild(this.$errors.get(0));

    // Fill Row with children
    this.children = [];
    this.field.fields.forEach((field) => {
      // Set default values if available
      this.params[field.name] = this.params[field.name] || field.default;

      const child = new H5PEditor.widgets[field.type](this, field, this.params[field.name], (field, value) => {
        // Update values
        this.params[field.name] = value;
        this.setValue(this.field, this.params);

        // Allow other widgets to listen to updates
        this.trigger('changed', this.params);
        this.changes.forEach((callback) => {
          callback(this.params);
        });
      });

      // Needs to be called here, because field is instantiated in appendTo(), not in constructor
      child.appendTo(row);

      // Move error fields into global error field
      this.$errors.append(child.$errors);

      if (child.field.type === 'number') {

        // Change attribute to HTML5 number input and use attributes
        if (this.field.inputrow.HTML5NumberField || child.field.inputRow && child.field.inputrow.HTML5NumberField) {
          child.$input.get(0).setAttribute('type', 'number');
          if (child.field.min) {
            child.$input.get(0).setAttribute('min', child.field.min);
          }
          if (child.field.max) {
            child.$input.get(0).setAttribute('max', child.field.max);
          }
          if (child.field.step) {
            child.$input.get(0).setAttribute('step', child.field.step);
          }
          if (!this.params[child.field.name] && child.field.default) {
            child.$input.get(0).setAttribute('value', child.field.default);
          }
        }

        // Trigger change event on enter
        if (this.field.inputrow.changedOnEnter || child.field.inputrow && child.field.inputrow.changedOnEnter) {
          child.$input.get(0).addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
              child.$input.change();
            }
          });
        }
      }

      // Respect 'none' widget
      if (child.field.widget === 'none') {
        child.$item.get(0).style.display = 'none';
      }

      this.children.push(child);
    });

    // Set values
    this.setValue(this.field, this.params);
  }

  /**
   * Append field to wrapper. Invoked by H5P core.
   * @param {H5P.jQuery} $wrapper Wrapper.
   */
  appendTo($wrapper) {
    this.$container.appendTo($wrapper);
  }

  /**
   * Validate current values. Invoked by H5P core.
   * @returns {boolean} True, if current value is valid, else false.
   */
  validate() {
    return this.children.every((child) => {
      const valid = child.validate();
      return (typeof valid !== 'undefined' && valid !== false);
    });
  }

  /**
   * Remove self. Invoked by H5P core.
   */
  remove() {
    this.$container.remove();
  }
}
export default InputRow;
