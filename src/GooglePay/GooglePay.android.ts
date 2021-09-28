import { NativeModules, DeviceEventEmitter } from 'react-native';
import PAYMENT_NETWORK from '../PaymentNetwork';
import { ListenerCryptogramCard, Product } from '../types';

const { GooglePay } = NativeModules;

class GooglePayModule {
  private static instance: GooglePayModule;
  private constructor() {}

  public static getInstance(): GooglePayModule {
    if (!GooglePayModule.instance) {
      GooglePayModule.instance = new GooglePayModule();
    }

    return GooglePayModule.instance;
  }

  public initial = (methodData: MethodDataPayment): void => {
    const { gateway } = methodData;

    this.setEnvironment(methodData.environmentRunning);
    this.setPaymentNetworks(methodData.supportedNetworks);
    this.setGatewayTokenSpecification(gateway.service, gateway.merchantId);
    this.setRequestPay(
      methodData.countryCode,
      methodData.currencyCode,
      methodData.merchantName,
      methodData.merchantId
    );
  };

  public setProducts = (product: Product): void => {
    GooglePay.setProducts(product);
  };

  private setEnvironment = (
    environmentRunning: EnvironmentRunningGooglePay
  ): void => {
    const numberConstantEnvironment =
      environmentRunning === 'Test'
        ? WalletConstants.ENVIRONMENT_TEST
        : WalletConstants.ENVIRONMENT_PRODUCTION;
    GooglePay.setEnvironment(numberConstantEnvironment);
  };

  private setPaymentNetworks = (
    paymentNetworks: Array<PAYMENT_NETWORK>
  ): void => {
    GooglePay.setPaymentNetworks(paymentNetworks);
  };

  private setRequestPay = (
    countryCode: string,
    currencyCode: string,
    merchantName: string,
    merchantId: string
  ): void => {
    GooglePay.setRequestPay(
      countryCode,
      currencyCode,
      merchantName,
      merchantId
    );
  };

  private setGatewayTokenSpecification = (
    gateway: string,
    gatewayMerchantId: string
  ): void => {
    GooglePay.setGatewayTokenSpecification(gateway, gatewayMerchantId);
  };

  public canMakePayments = async (): Promise<boolean> => {
    const isCanMakePayments: boolean = await GooglePay.canMakePayments();
    return isCanMakePayments;
  };

  public openServicePay = (): void => {
    GooglePay.openGooglePay();
  };

  public listenerCryptogramCard = (callback: ListenerCryptogramCard): void => {
    DeviceEventEmitter.addListener('listenerCryptogramCard', callback);
  };

  public removeListenerCryptogramCard = (): void => {
    DeviceEventEmitter.removeAllListeners('listenerCryptogramCard');
  };
}

interface MethodDataPayment {
  merchantId: string;
  merchantName: string;
  gateway: {
    service: string;
    merchantId: string;
  };
  supportedNetworks: Array<PAYMENT_NETWORK>;
  countryCode: string;
  currencyCode: string;
  environmentRunning: EnvironmentRunningGooglePay;
}

type EnvironmentRunningGooglePay = 'Test' | 'Production';

enum WalletConstants {
  ENVIRONMENT_TEST = 3,
  ENVIRONMENT_PRODUCTION = 1,
}

export default GooglePayModule.getInstance();
