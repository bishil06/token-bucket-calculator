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

    if (fillIntervalUnit === 'sec') {
      this.fillIntervalMSec = 1000;
    } else if (fillIntervalUnit === 'min') {
      this.fillIntervalMSec = 1000 * 60;
    } else if (fillIntervalUnit === 'hr') {
      this.fillIntervalMSec = 1000 * 60 * 60;
    } else if (fillIntervalUnit === 'day') {
      this.fillIntervalMSec = 1000 * 60 * 60 * 24;
    } else {
      this.fillIntervalMSec = 1;
    }

    this.content = startBucketFirstFill ? this.fillIntervalMSec : 0;

    this.lastFillMSec = getMSec();
  }

  async removeTokens(tokens: number): Promise<number> {
    this.fillTokens();

    const waitTime = this.calcTimeForRemovingTokens(tokens);
    if (waitTime !== 0) {
      await wait(waitTime);
      this.fillTokens();
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

  fillTokens() {
    const nowMSec = getMSec();
    const timeForAfterFillingMSec = nowMSec - this.lastFillMSec;

    this.setLastFillMSec(nowMSec);

    const tokenToFillAmount =
      timeForAfterFillingMSec * (this.fillAmount / this.fillIntervalMSec);

    this.addContent(tokenToFillAmount);
  }

  setLastFillMSec(ms: number) {
    this.lastFillMSec = ms;
  }

  addContent(tokens: number) {
    return (this.content = Math.min(this.bucketSize, this.content + tokens));
  }

  subContent(tokens: number) {
    return (this.content = Math.max(0, this.content - tokens));
  }
}
