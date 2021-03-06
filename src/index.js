import DatePicker from 'DPicker'
import 'dpicker/dist/dpicker.time'
import 'dpicker/dist/dpicker.modifiers'

/**
 * Feature class added to dpicker root element.
 * @private
 * @type {String}
 */
const FEATURE_CLASS = 'ft-dpicker'

/**
 * Class used for select container.
 * @private
 * @type {String}
 */
const SELECT_CONTAINER_CLASS = 'select'

/**
 * Data key used for saving the MaterialTextfield instance if used as MDL component.
 * @private
 * @type {String}
 */
const DATA_KEY_MDL_TEXTFIELD = 'materialTextfieldInstance'

/**
 * Wrap given select(s) with div container.
 * @private
 *
 * @param   {Element} $rendered - Rendered selects
 * @returns {Element} Rendered selects wrapped in a div container.
 */
var addSelectWrapper = function($rendered) {
  var $output,
    $selects = $rendered.querySelectorAll('select')

  if ($selects.length) {
    $output = $rendered

    $selects.forEach(($select, i) => {
      var $parent = $select.parentNode
      var $wrappedSelect = document.createElement('div')
      $wrappedSelect.classList.add(SELECT_CONTAINER_CLASS)
      $wrappedSelect.appendChild($select)
      $parent.appendChild($wrappedSelect)
    })
  } else if ($rendered.nodeName.toLowerCase() == 'select') {
    $output = document.createElement('div')
    $output.classList.add(SELECT_CONTAINER_CLASS)
    $output.appendChild($rendered)
  }

  return $output
}

/**
 * DPicker module to allow render custom selects (add container to style them).
 * @type {Object}
 */
DatePicker.modules.customSelectModule = {
  render: {
    /** Overwritten years render method to wrap in own select. */
    years: function(events, data, toRender) {
      return addSelectWrapper(DatePicker.prototype.renderYears(events, data, toRender))
    },
    /** Overwritten months render method to wrap in own select. */
    months: function(events, data, toRender) {
      return addSelectWrapper(DatePicker.prototype.renderMonths(events, data, toRender))
    },
    time: function(events, data, toRender) {
      var $span = DatePicker.modules.time.render.time(events, data, toRender)
      return addSelectWrapper($span)
    }
  }
}

/**
 * DPicker module to add MDL support.
 * @type {Object}
 */
DatePicker.modules.mdlModule = {
  events: {
    inputFocus: function(e) {
      var instance = base.utils.data.get(e.target, DATA_KEY_MDL_TEXTFIELD)
      if (instance) instance.onFocus_()
    },
    inputBlur: function(e) {
      var instance = base.utils.data.get(e.target, DATA_KEY_MDL_TEXTFIELD)
      if (instance) instance.onBlur_()
    }
  }
}

/**
 * Select search feature class.
 */
class DateTimePicker extends base.features.Feature {

  init() {
    this._$materialWrapper = null
    this._$materialTextfield = null

    if (this.options.mdl) {
      this._$materialWrapper = this.node.closest(`.${this.options.mdlContainerClass}`)
      // create a material textfield instance manually because we use our own mdl class
      this._$materialTextfield = new MaterialTextfield(this._$materialWrapper)
    }

    this.picker = new DatePicker(this.node, this.options)
    this.picker.time = this.options.time

    this.picker.rootElement.classList.add(FEATURE_CLASS)
    this.picker.rootElement.classList.add(this.options.themeClass)

    this._givenDpickerOnChangeListener = this.picker.onChange

    if (this.options.mdl) {
      this.picker.rootElement.classList.add(this.options.mdlClass)
      var newInput = this.picker.rootElement.querySelector('input')

      // add material css input class
      newInput.classList.add(this._$materialTextfield.CssClasses_.INPUT)
      // update material input element with new input element created by dpicker
      this._$materialTextfield.input_ = newInput

      base.utils.data.set(newInput, DATA_KEY_MDL_TEXTFIELD, this._$materialTextfield)
    }

    this.picker.onChange = () => {
      this._dpickerOnChange()
    }
  }

  _dpickerOnChange() {
    if (this.options.mdl) {
      this._$materialTextfield.updateClasses_()
      this._$materialTextfield.input_.classList.add(this._$materialTextfield.CssClasses_.INPUT)
    }

    this._givenDpickerOnChangeListener()
  }

  destroy() {
    super.destroy()
    this.picker = null
  }

}

/**
 * Default feature options (also used to initialize dpicker instance).
 *
 * @see https://soyuka.github.io/dpicker/DPicker.html
 *
 * @type {Object}
 * @property {Boolean} mdl=false - Whether datepicker should be initialized als MDL component.
 * @property {String}  mdlClass='' - Class used for mdl variant.
 * @property {String}  mdlContainerClass='mdl-js-datetimefield' - MDL container class (replacement for `mdl-js-textfield`).
 * @property {String}  themeClass='' - Theme class to overwrite theme.
 */
DateTimePicker.defaultOptions = {
  mdl: false,
  mdlClass: '-mdl',
  mdlContainerClass: 'mdl-js-datetimefield',
  themeClass: '',
  // dpicker options
  time: true,
  meridiem: false,
  order: ['years', 'months', 'time', 'days'],
  format: 'DD.MM.YYYY HH:mm',
  model: moment(),
  min: moment().subtract(2, 'year'), // today -2 years
  max: moment().add(2, 'year') // today +2 years
}

export default DateTimePicker
