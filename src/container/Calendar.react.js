/**
* Calendar container component.
* @flow
*/

console.ignoredYellowBox = ['Warning: Overriding '];

import React, { Component, PropTypes } from 'react';
import {
  LayoutAnimation,
  Slider,
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
  Image,
} from 'react-native';

// Component specific libraries.
import _ from 'lodash';
import Moment from 'moment';
// Pure components importing.
import YearSelector from '../pure/YearSelector.react';
import MonthSelector from '../pure/MonthSelector.react';
import DaySelector from '../pure/DaySelector.react';

type Stage = "day" | "month" | "year";
const DAY_SELECTOR : Stage = "day";
const MONTH_SELECTOR : Stage = "month";
const YEAR_SELECTOR : Stage = "year";

// Unicode characters
const LEFT_CHEVRON = '\u276E';
const RIGHT_CHEVRON = '\u276F';

type Props = {
  // The core properties.
  selected?: Moment,
  rangeSelected?: Moment,
  onChange?: (date: Moment) => void,
  slideThreshold?: number,
  // Minimum and maximum date.
  minDate: Moment,
  maxDate: Moment,
  // The starting stage for selection. Defaults to day.
  startStage: Stage,
  // General styling properties.
  calendarStyles?: React.PropTypes.object,

  style?: View.propTypes.style,

  stageView?: View.propTypes.style,
  showArrows: boolean,
  leftIcon: React.PropTypes.any,
  rightIcon: React.PropTypes.any,

  weekRowHeight: React.PropTypes.number,
  // Styling properties for selecting the day.
  dayTodayText?: Text.propTypes.style,
  dayDisabledText?: Text.propTypes.style,
  // Styling properties for selecting the month.
  monthText?: Text.propTypes.style,
  monthDisabledText?: Text.propTypes.style,
  // Styling properties for selecting the year.
  yearMinTintColor?: string,
  yearMaxTintColor?: string,
  yearSlider?: Slider.propTypes.style,
  yearText?: Text.propTypes.style,
};
type State = {
  stage: Stage,
  // Focus points to the first day of the month that is in current focus.
  focus: Moment,
};

export default class Calendar extends Component {
  props: Props;
  state: State;
  static defaultProps: Props;

  constructor(props: Props) {
    super(props);

    let focus = Moment().startOf('month');

    if (Moment(props.selected).isValid()) {
      focus = Moment(props.selected).startOf('month');
    }

    this.state = {
      stage: props.startStage,
      focus,
      monthOffset: 0,
      yearOffset: 0,
    }
  }

  _stageText = () : string => {
    if (this.state.stage === DAY_SELECTOR) {
      return this.state.focus.format('MMMM YYYY');
    } else {
      return this.state.focus.format('YYYY');
    }
  }

  _previousStage = () : void => {
    if (this.state.stage === DAY_SELECTOR) {
      this.setState({stage: MONTH_SELECTOR})
    }
    if (this.state.stage === MONTH_SELECTOR) {
      this.setState({stage: YEAR_SELECTOR})
    }
    LayoutAnimation.easeInEaseOut();
  };

  _nextStage = () : void => {
    if (this.state.stage === MONTH_SELECTOR) {
      this.setState({stage: DAY_SELECTOR})
    }
    if (this.state.stage === YEAR_SELECTOR) {
      this.setState({stage: MONTH_SELECTOR})
    }
    LayoutAnimation.easeInEaseOut();
  };

  _goBackward = (stage) : void => {
    if (stage === DAY_SELECTOR) {
      this.setState({monthOffset: -1});
    } else {
      this.setState({yearOffset: -1});
    }
  };

  _goForward = (stage) : void => {
    if (stage === DAY_SELECTOR) {
      this.setState({monthOffset: 1});
    } else {
      this.setState({yearOffset: 1});
    }
  };

  _changeFocus = (focus, nextStage = false) => {
    this.setState({focus, monthOffset: 0, yearOffset: 0});

    if (nextStage) {
      this._nextStage()
    }
  };

  render() {
    const { calendarStyles, weekRowHeight, showArrows, minDate, maxDate } = this.props;
    const { focus, stage } = this.state;

    const barStyle = StyleSheet.flatten(calendarStyles.headerBar);
    const diffStage = stage === DAY_SELECTOR ? 'month' : 'year';

    const previous = Moment(focus).subtract(1, diffStage);
    const previousValid = minDate.diff(Moment(previous).endOf(diffStage), 'seconds') <= 0;
    const next = Moment(focus).add(1, diffStage);
    const nextValid = maxDate.diff(Moment(next).startOf(diffStage), 'seconds') >= 0;

    return (
      <View style={calendarStyles.wrapper}>
        <View style={{ flexDirection: 'row' }}>
          <View style={calendarStyles.headerBar}>
            <TouchableHighlight
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              underlayColor={barStyle ? barStyle.backgroundColor : 'transparent'}
              onPress={() => { if (showArrows && previousValid) { this._goBackward(stage); } }}
              style={calendarStyles.arrowButton}
            >
              {
                showArrows && previousValid ?
                  <Image source={this.props.leftIcon} />
                  : <View />
              }
            </TouchableHighlight>

            <TouchableHighlight
              activeOpacity={stage === DAY_SELECTOR ? 0.8 : 1}
              underlayColor={barStyle ? barStyle.backgroundColor : 'transparent'}
              onPress={() => {
                if (stage === DAY_SELECTOR) {
                  this._previousStage();
                }
              }}
              style={{ alignSelf: 'center' }}
            >
              <Text style={calendarStyles.headerText}>
                {this._stageText()}
              </Text>
            </TouchableHighlight>

            <TouchableHighlight
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              underlayColor={barStyle ? barStyle.backgroundColor : 'transparent'}
              onPress={() => { if (showArrows && nextValid) { this._goForward(stage); } }}
              style={calendarStyles.arrowButton}
            >
              { showArrows && nextValid ?
                <Image source={this.props.rightIcon} />
                : <View />
              }
            </TouchableHighlight>
          </View>
        </View>
        <View
          style={this.props.stageView}>
          {
            this.state.stage === DAY_SELECTOR ?
            <DaySelector
              focus={this.state.focus}
              selected={this.props.selected}
              rangeSelected={this.props.rangeSelected}
              onFocus={this._changeFocus}
              onChange={(date) => this.props.onChange && this.props.onChange(date)}
              monthOffset={this.state.monthOffset}
              minDate={this.props.minDate}
              maxDate={this.props.maxDate}
              // Control properties
              slideThreshold={this.props.slideThreshold}
              // Transfer the corresponding styling properties.
              dayHeaderView={calendarStyles.dayNameBar}
              dayHeaderText={calendarStyles.dayNameText}
              dayRowView={[calendarStyles.weekRow, { height: weekRowHeight }]}
              dayView={calendarStyles.individualDay}
              daySelectedView={calendarStyles.activeDay}
              dayText={calendarStyles.dayNumberText}
              dayTodayText={this.props.dayTodayText}
              daySelectedText={calendarStyles.dayNumberActiveText}
              dayDisabledText={calendarStyles.dayNumberDisabledText}
              /> :
            this.state.stage === MONTH_SELECTOR ?
            <MonthSelector
              focus={this.state.focus}
              onFocus={this._changeFocus}
              yearOffset={this.state.yearOffset}
              minDate={this.props.minDate}
              maxDate={this.props.maxDate}
              // Styling properties
              monthText={calendarStyles.monthText}
              monthDisabledText={calendarStyles.disabledMonthText}
              group={calendarStyles.threeMonthRow}
              /> :
            this.state.stage === YEAR_SELECTOR ?
            <YearSelector
              focus={this.state.focus}
              onFocus={this._changeFocus}
              minDate={this.props.minDate}
              maxDate={this.props.maxDate}
              // Styling properties
              minimumTrackTintColor={this.props.yearMinTintColor}
              maximumTrackTintColor={this.props.yearMaxTintColor}
              yearSlider={this.props.yearSlider}
              yearText={this.props.yearText}
              /> :
            null
          }
        </View>
      </View>
    );
  }
}
Calendar.defaultProps = {
  minDate: Moment(),
  maxDate: Moment().add(10, 'years'),
  startStage: DAY_SELECTOR,
  showArrows: false,
};
