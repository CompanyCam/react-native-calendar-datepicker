/**
* DaySelector pure component.
* @flow
*/

import React, { Component, PropTypes } from 'react';
import {
  Dimensions,
  TouchableHighlight,
  LayoutAnimation,
  View,
  Text,
} from 'react-native';

// Component specific libraries.
import _ from 'lodash';
import Moment from 'moment';

type Props = {
  // Focus and selection control.
  focus: Moment,
  selected?: Moment,
  rangeSelected?: Moment,
  onChange?: (date: Moment) => void,
  onFocus?: (date: Moment) => void,
  slideThreshold?: number,
  monthOffset?: number,
  // Minimum and maximum dates.
  minDate: Moment,
  maxDate: Moment,
  // Styling properties.
  dayHeaderView?: View.propTypes.style,
  dayHeaderText?: Text.propTypes.style,
  dayRowView?: View.propTypes.style,
  dayView?: View.propTypes.style,
  daySelectedView?: View.propTypes.style,
  dayText?: Text.propTypes.style,
  dayTodayText?: Text.propTypes.style,
  daySelectedText?: Text.propTypes.style,
  dayDisabledText?: Text.propTypes.style,
};
type State = {
  days: Array<Array<Object>>,
};

export default class DaySelector extends Component {
  props: Props;
  state: State;
  static defaultProps: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      days: this._computeDays(props),
    }
  }

  _slide = (dx : number) => {
    this.refs.wrapper.setNativeProps({
      style: {
        left: dx,
      }
    })
  };


  componentWillReceiveProps(nextProps: Object) {
    if (this.props.focus != nextProps.focus ||
        this.props.selected != nextProps.selected ||
        this.props.rangeSelected != nextProps.rangeSelected) {
      this.setState({
        days: this._computeDays(nextProps),
      })
    }

    if (this.props.monthOffset != nextProps.monthOffset && nextProps.monthOffset !== 0) {
      const newFocus = Moment(this.props.focus).add(nextProps.monthOffset, 'month');
      this.props.onFocus && this.props.onFocus(newFocus);
    }
  }

  _computeDays = (props: Object) : Array<Array<Object>> => {
    let result = [];
    const currentMonth = props.focus.month();
    let iterator = Moment(props.focus);
    while (iterator.month() === currentMonth) {
      if (iterator.weekday() === 0 || result.length === 0) {
        result.push(_.times(7, _.constant({})));
      }
      let week = result[result.length - 1];
      week[iterator.weekday()] = {
        valid: this.props.maxDate.diff(iterator, 'seconds') >= 0 &&
               this.props.minDate.diff(iterator, 'seconds') <= 0,
        date: iterator.date(),
        selected: props.rangeSelected ?
                    iterator.isBetween(props.selected, props.rangeSelected, 'days', '[]') :
                    props.selected && iterator.isSame(props.selected, 'day'),
        today: iterator.isSame(Moment(), 'day'),
        start: props.rangeSelected ? iterator.isSame(props.selected, 'day') : null,
        end: props.rangeSelected ? iterator.isSame(props.rangeSelected, 'day') : null,
      };
      // Add it to the result here.
      iterator.add(1, 'day');
    }
    LayoutAnimation.easeInEaseOut();
    return result;
  };

  _onChange = (day : Object) : void => {
    let date = Moment(this.props.focus).add(day.date - 1 , 'day');
    this.props.onChange && this.props.onChange(date);
  }

  render() {
    return (
      <View>
        <View style={this.props.dayHeaderView}>
          {_.map(Moment.weekdaysShort(true), (day) =>
            <Text key={day} style={this.props.dayHeaderText}>
              {day}
            </Text>
          )}
        </View>
        <View ref="wrapper">
          {_.map(this.state.days, (week, i) =>
            <View key={i} style={[
                this.props.dayRowView,
                i === this.state.days.length - 1 ? {
                  borderBottomWidth: 0,
                } : null,
              ]}>
              {_.map(week, (day, j) =>
                <TouchableHighlight
                  key={j}
                  activeOpacity={day.valid ? 0.8 : 1}
                  underlayColor='transparent'
                  onPress={() => day.valid && this._onChange(day)}
                  style={[
                    this.props.dayView,
                    day.selected ? this.props.daySelectedView : null,
                  ]}
                >
                    <Text style={[
                      this.props.dayText,
                      day.today ? this.props.dayTodayText : null,
                      day.selected ? this.props.daySelectedText : null,
                      day.valid ? null : this.props.dayDisabledText,
                    ]}>
                      {day.date}
                    </Text>
                </TouchableHighlight>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }
}
DaySelector.defaultProps = {
  focus: Moment().startOf('month'),
  minDate: Moment(),
  maxDate: Moment(),
};
