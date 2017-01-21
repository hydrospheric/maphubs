var React = require('react');
var Formsy = require('formsy-react');
var classNames = require('classnames');
var $ = require('jquery');
var PureRenderMixin = require('react-addons-pure-render-mixin');

var Toggle= React.createClass({

  mixins: [PureRenderMixin, Formsy.Mixin],


  propTypes:  {
    className: React.PropTypes.string,
    dataTooltip: React.PropTypes.string,
    dataDelay: React.PropTypes.number,
    dataPosition: React.PropTypes.string,
    defaultChecked: React.PropTypes.bool,
    labelOn: React.PropTypes.string.isRequired,
    labelOff: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    style: React.PropTypes.object,
    disabled: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },


  getDefaultProps() {
    return {
      style: {},
      defaultChecked: false,
      dataDelay: 100,
      disabled: false
    };
  },

  changeValue(event) {
    event.stopPropagation();
     this.setValue(event.currentTarget.checked);
     if(this.props.onChange){this.props.onChange(event.currentTarget.checked);}
   },

   componentWillMount() {
     this.setValue(this.props.defaultChecked ? this.props.defaultChecked : false);
   },

   componentDidMount(){
     $(this.refs.toggle).tooltip();
  },

   componentWillReceiveProps(nextProps){
     if(nextProps.defaultChecked != this.props.defaultChecked){
       this.setValue(nextProps.defaultChecked);
     }
   },

   componentDidUpdate(prevProps){
    if(!prevProps.dataTooltip && this.props.dataTooltip){
      $(this.refs.toggle).tooltip();
    }
  },

  render() {
     var className = classNames('switch', this.props.className, {tooltipped: this.props.dataTooltip ? true : false});

     var defaultChecked = this.props.defaultChecked ? this.props.defaultChecked : false;

    return (
          <div ref="toggle" className={className} disabled={this.props.disabled} data-delay={this.props.dataDelay} data-position={this.props.dataPosition}
              style={this.props.style}
              data-tooltip={this.props.dataTooltip}>
            <label>
              {this.props.labelOff}
              <input type="checkbox" id={this.props.name} defaultChecked={defaultChecked} disabled={this.props.disabled} onChange={this.changeValue}/>
              <span className="lever"></span>
              {this.props.labelOn}
            </label>
          </div>
    );

  }
});

module.exports = Toggle;
