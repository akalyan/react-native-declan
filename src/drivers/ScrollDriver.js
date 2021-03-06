// @flow

/* This borrows heavily from the shoutem/animation library */

import { Animated } from 'react-native';
import EventEmitter from 'eventemitter3';

import { Driver, Layout, LayoutEvent } from '../types';

type ScrollViewProps = {
  onScroll: Animated.event,
  scrollEventThrottle: number,
  onLayout: LayoutEvent => void,
  onMomentumScrollEnd: () => void,
  onMomentumScrollBegin: () => void,
  onScrollEndDrag: () => void,
  onScrollBeginDrag: () => void,
};

export type ScrollDirection = 'UP' | 'DOWN' | 'NONE';

export default class ScrollDriver implements Driver {
  scrolling: boolean = false;
  currentPosition: number = 0;
  scrollDirection: ScrollDirection;
  scrollDirectionEmitter: EventEmitter = new EventEmitter();

  constructor() {
    this.onScrollViewLayout = this.onScrollViewLayout.bind(this);
    this.onScrollBegin = this.onScrollBegin.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);

    this.value = new Animated.Value(0);
    this.value.addListener(({ value }) => {
      if (this.scrolling) {
        this.setDirection(value < this.currentPosition ? 'UP' : 'DOWN');
      }
      this.currentPosition = value;
    });
    this.setDirection('NONE');

    this.scrollViewProps = {
      onScroll: Animated.event(
        [{ nativeEvent: { contentOffset: { y: this.value } } }],
        { useNativeDriver: false },
      ),
      scrollEventThrottle: 1,
      onLayout: this.onScrollViewLayout,
      onMomentumScrollEnd: this.onScrollEnd,
      onMomentumScrollBegin: this.onScrollBegin,
      onScrollEndDrag: this.onScrollEnd,
      onScrollBeginDrag: this.onScrollBegin,
    };
  }

  onScrollViewLayout: LayoutEvent => void;
  layout: Layout;
  value: Animated.Value;
  scrollViewProps: ScrollViewProps;
  onScrollBegin: () => void;
  onScrollEnd: () => void;

  onScrollViewLayout(event: LayoutEvent) {
    this.layout = event.nativeEvent.layout;
  }

  setDirection(newDirection: ScrollDirection) {
    if (newDirection !== this.scrollDirection) {
      this.scrollDirection = newDirection;
      this.scrollDirectionEmitter.emit('directionChanged', newDirection);
    }
  }

  onScrollEnd() {
    this.scrolling = false;
    this.setDirection('NONE');
  }

  onScrollBegin() {
    this.scrolling = true;
  }
}
