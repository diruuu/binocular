import { checkListenKey } from '../account-slice';
import {
  selectListenKey,
  selectListenKeyUpdatedAt,
} from '../selectors/account-selectors';
import { getListenKey } from '../actions/account-actions';

jest.mock('../selectors/account-selectors');
jest.mock('../actions/account-actions');

jest.fn();

const dispatch = jest.fn((fn) => {
  fn();
});
const getState: any = jest.fn(() => ({}));

describe('Account slice: checkListenKey', () => {
  beforeEach(() => {
    (selectListenKey as jest.Mock<any, any>).mockReset();
    (selectListenKeyUpdatedAt as jest.Mock<any, any>).mockReset();
    (getListenKey as jest.Mock<any, any>).mockReset();
  });
  it('should update listen key if last updated key is more than 30 minutes ago', () => {
    (selectListenKey as jest.Mock<any, any>).mockImplementationOnce(
      () => 'listen_key'
    );
    const minutes = 31;
    (selectListenKeyUpdatedAt as jest.Mock<any, any>).mockImplementationOnce(
      () => new Date().getTime() - minutes * 60 * 1000
    );
    checkListenKey()(dispatch, getState, {});
    expect(getListenKey).toBeCalled();
  });
  it('should not update listen key if last updated key is less than 30 minutes ago', () => {
    (selectListenKey as jest.Mock<any, any>).mockImplementationOnce(
      () => 'listen_key'
    );
    const minutes = 29;
    (selectListenKeyUpdatedAt as jest.Mock<any, any>).mockImplementationOnce(
      () => new Date().getTime() - minutes * 60 * 1000
    );
    checkListenKey()(dispatch, getState, {});
    expect(getListenKey).not.toBeCalled();
  });
});
