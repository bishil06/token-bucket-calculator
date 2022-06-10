import getMSec from './getMSec';
import wait from './wait';

export interface TokenBucketCalculatorOption {
  bucketSize: number;
  fillIntervalUnit?: 'ms' | 'sec' | 'min' | 'hr' | 'day';
  fillAmount: number;
  startBucketFirstFill?: boolean;
}

export class TokenBucketCalculator {
  bucketSize: number;
  fillIntervalMSec: number;
  fillAmount: number;
  content: number;
  lastFillMSec: number;

  constructor({
    bucketSize,
    fillAmount,
    fillIntervalUnit = 'sec',
    startBucketFirstFill = false,
  }: TokenBucketCalculatorOption) {
    this.bucketSize = bucketSize;
    this.fillAmount = fillAmount;

    this.fillIntervalMSec = this.calcFillIntervalMSec(fillIntervalUnit);

    this.content = startBucketFirstFill ? this.fillIntervalMSec : 0;

    this.lastFillMSec = getMSec();
  }

  private calcFillIntervalMSec(
    fillIntervalUnit: 'ms' | 'sec' | 'min' | 'hr' | 'day' = 'ms'
  ) {
    if (fillIntervalUnit === 'sec') {
      return 1000;
    } else if (fillIntervalUnit === 'min') {
      return 1000 * 60;
    } else if (fillIntervalUnit === 'hr') {
      return 1000 * 60 * 60;
    } else if (fillIntervalUnit === 'day') {
      return 1000 * 60 * 60 * 24;
    } else {
      return 1;
    }
  }

  changeFillAmount(
    fillAmount: number,
    fillIntervalUnit: 'ms' | 'sec' | 'min' | 'hr' | 'day' = 'ms'
  ) {
    this.fillAmount = fillAmount;
    this.fillIntervalMSec = this.calcFillIntervalMSec(fillIntervalUnit);
  }

  async removeTokens(tokens: number): Promise<number> {
    const nowFillAmout = this.fillAmount;
    const nowFillIntervalMSec = this.fillIntervalMSec;

    this.fillTokens(nowFillAmout, nowFillIntervalMSec);

    const waitTime = this.calcTimeForRemovingTokens(tokens);
    if (waitTime !== 0) {
      await wait(waitTime);
      this.fillTokens(nowFillAmout, nowFillIntervalMSec);
    }

    return this.subContent(tokens);
  }

  calcTimeForRemovingTokens(tokens: number): number {
    if (this.content < tokens) {
      const willRemoveTokens = tokens - this.content;
      const msecPerAmount = this.fillIntervalMSec / this.fillAmount;
      return Math.ceil(willRemoveTokens * msecPerAmount);
    } else {
      return 0;
    }
  }

  private fillTokens(
    fillAmount = this.fillAmount,
    fillIntervalMSec = this.fillIntervalMSec
  ) {
    const nowMSec = getMSec();
    const timeForAfterFillingMSec = nowMSec - this.lastFillMSec;

    this.setLastFillMSec(nowMSec);

    const tokenToFillAmount =
      timeForAfterFillingMSec * (fillAmount / fillIntervalMSec);

    this.addContent(tokenToFillAmount);
  }

  private setLastFillMSec(ms: number) {
    this.lastFillMSec = ms;
  }

  private addContent(tokens: number) {
    return (this.content = Math.min(this.bucketSize, this.content + tokens));
  }

  private subContent(tokens: number) {
    return (this.content = Math.max(0, this.content - tokens));
  }
}
