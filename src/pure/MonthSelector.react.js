/**
* MonthSelector pure component.
* @flow
*/

import React, { Component, PropTypes } from 'react';
import {
  TouchableHighlight,
  View,
  Text,
} from 'react-native';

// Component specific libraries.
import _ from 'lodash';
import Moment from 'moment';

type Props = {
  style?: View.propTypes.style,
  // Controls the focus of the calendar.
  focus: Moment,
  onFocus?: (date: Moment) => void,
  // Minimum and maximum valid dates.
  minDate: Moment,
  maxDate: Moment,
  // Styling properties.
  monthText?: Text.propTypes.style,
  monthDisabledText?: Text.propTypes.style,
};
type State = {
  months: Array<Array<Object>>,
};

export default class MonthSelector extends Component {
  props: Props;
  state: State;
  static defaultProps: Props;

  constructor(props: Object) {
    super(props);

    const months = Moment.monthsShort();
    let groups = [];
    let group = [];
    _.map(months, (month, index) => {
      if (index % 3 === 0) {
        group = [];
        groups.push(group);
      }
      // Check if the month is valid.
      let maxChoice = Moment(this.props.focus).month(index).endOf('month');
      let minChoice = Moment(this.props.focus).month(index).startOf('month');
      group.push({
        valid: this.props.maxDate.diff(minChoice, 'seconds') >= 0 &&
               this.props.minDate.diff(maxChoice, 'seconds') <= 0,
        name: month,
        index,
      });
    })

    this.state = {
      months: groups,
    };
  }

  componentWillReceiveProps(nextProps: Object) {
    if (this.props.year != nextProps.yearOffset && nextProps.yearOffset !== 0) {
      const newFocus = Moment(this.props.focus).add(nextProps.yearOffset, 'year');
      this.props.onFocus && this.props.onFocus(newFocus);
      this._computeMonths(newFocus);
    }
  }

  _computeMonths = (newFocus) => {
    const months = Moment.monthsShort();
    let groups = [];
    let group = [];
    _.map(months, (month, index) => {
      if (index % 3 === 0) {
        group = [];
        groups.push(group);
      }
      // Check if the month is valid.
      let maxChoice = Moment(newFocus).month(index).endOf('month');
      let minChoice = Moment(newFocus).month(index).startOf('month');
      group.push({
        valid: this.props.maxDate.diff(minChoice, 'seconds') >= 0 &&
               this.props.minDate.diff(maxChoice, 'seconds') <= 0,
        name: month,
        index,
      });
    })

    this.setState({ months: groups });
  }

  _onFocus = (index : number) : void => {
    let focus = Moment(this.props.focus);
    focus.month(index);
    this.props.onFocus && this.props.onFocus(focus, true);
  }

  render() {
    return (
      <View style={[{
        // Wrapper view default style.
      },this.props.style]}>
        {_.map(this.state.months, (group, i) =>
          <View key={i} style={[this.props.group]}>
            {_.map(group, (month, j) =>
              <TouchableHighlight
                key={j}
                style={{flexGrow: 1}}
                activeOpacity={month.valid ? 0.8 : 1}
                underlayColor='transparent'
                onPress={() => month.valid && this._onFocus(month.index)}>
                <Text style={[
                  this.props.monthText,
                  month.valid ? null : this.props.monthDisabledText,
                ]}>
                  {month.name}
                </Text>
              </TouchableHighlight>
            )}
          </View>
        )}
      </View>
    );
  }
}
MonthSelector.defaultProps = {
  focus: Moment(),
  minDate: Moment(),
  maxDate: Moment(),
};
