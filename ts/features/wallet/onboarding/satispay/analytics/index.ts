import { getType } from "typesafe-actions";
import { mixpanel } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import { isTimeoutError } from "../../../../utils/errors";
import {
  addSatispayToWallet,
  searchUserSatispay,
  walletAddSatispayBack,
  walletAddSatispayCancel,
  walletAddSatispayCompleted,
  walletAddSatispayStart
} from "../store/actions";

// eslint-disable-next-line complexity
const trackAction = (mp: NonNullable<typeof mixpanel>) => (
  action: Action
): Promise<any> => {
  switch (action.type) {
    case getType(searchUserSatispay.request):
    case getType(walletAddSatispayStart):
    case getType(walletAddSatispayCompleted):
    case getType(walletAddSatispayCancel):
    case getType(walletAddSatispayBack):
    case getType(addSatispayToWallet.request):
    case getType(addSatispayToWallet.success):
      return mp.track(action.type);

    case getType(searchUserSatispay.failure):
      return mp.track(action.type, {
        reason: isTimeoutError(action.payload)
          ? action.payload.kind
          : action.payload.value.message
      });

    case getType(addSatispayToWallet.failure):
      return mp.track(action.type, { reason: action.payload.message });
  }
  return Promise.resolve();
};

export default trackAction;
