package com.reactnativecloudpayments;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.module.annotations.ReactModule;
import com.fasterxml.jackson.databind.ObjectMapper

import ru.cloudpayments.sdk.card.CardType;
import ru.cloudpayments.sdk.card.Card;
import ru.cloudpayments.sdk.configuration.CloudpaymentsSDK;
import ru.cloudpayments.sdk.api.CloudpaymentsApi;

import io.reactivex.schedulers.Schedulers;
import io.reactivex.android.schedulers.AndroidSchedulers


@ReactModule(name = CardService.MODULE_NAME)
class CardService(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {
  companion object {
    const val MODULE_NAME: String = "CardService";
  }

  override fun getName() = MODULE_NAME;

  @ReactMethod
  fun cardType(cardNumber: String, promise: Promise?) {
    val cardType: CardType = CardType.getType(cardNumber);
    promise?.resolve(cardType.toString());
  }

  @ReactMethod
  fun isCardNumberValid(cardNumber: String, promise: Promise?) {
    val isCardNumberValid: Boolean = Card.isValidNumber(cardNumber);
    promise?.resolve(isCardNumberValid);
  }

  @ReactMethod
  fun isExpDateValid(cardExpDate: String, promise: Promise?) {
    val isExpDateValid: Boolean = Card.isValidExpDate(cardExpDate);
    promise?.resolve(isExpDateValid);
  }

  @ReactMethod
  fun makeCardCryptogramPacket(cardNumber: String, expDate: String, cvv: String, merchantId: String, promise: Promise?) {
    val cardCryptogram: String? = Card.cardCryptogram(cardNumber, expDate, cvv, merchantId);
    promise?.resolve(cardCryptogram);
  }

  @ReactMethod
  fun makeCardCryptogramPacketForCvv(cvv: String, promise: Promise?) {
    val cvvCryptogramPacket: String? = Card.cardCryptogramForCVV(cvv);
    promise?.resolve(cvvCryptogramPacket);
  }

  @ReactMethod
  fun getBinInfo(cardNumber: String, merchantId: String, promise: Promise?) {
    val api: CloudpaymentsApi = CloudpaymentsSDK.createApi(merchantId)
    api.getBinInfo(cardNumber)
      .subscribeOn(Schedulers.io()) // указываем в каком потоке будет выполнятся процесс observe
      .observeOn(AndroidSchedulers.mainThread()) // получаем результат в главном потоке
      .subscribe({ info ->
        // конвертируем класс в json для передачи в rn
         val objectMapper = ObjectMapper();
         val bankInfo = objectMapper.writeValueAsString(info)

         promise?.resolve(bankInfo)
      },
      {error -> promise?.reject("", error.message)})
  }
}
