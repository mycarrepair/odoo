odoo.define('l10n_mn_pos_tax_integration.screens', function (require) {
"use strict";

    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const { posbus } = require('point_of_sale.utils');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const PaymentScreen = require('point_of_sale.PaymentScreen');
    
    const CustomButtonPaymentScreen = (PaymentScreen) => class extends PaymentScreen {
            constructor() {
                super(...arguments);
            }
            IsCustomButton() {
                // click_invoice
                // Gui.showPopup("ErrorPopup", {
                //     title: this.env._t('Payment Screen Custom Button Clicked'),
                //     body: this.env._t('Welcome to OWL'),
                // });
                Gui.showPopup("MnPosTaxTINPopup", {
                    title : this.env._t("Регистер ээ оруулна уу"),
                    confirmText: this.env._t("Батлах"),
                    cancelText: this.env._t("Цуцлах"),
                });
            }

            async _isOrderValid() {
                var proxyURL = 'http://' + this.pos.config.mn_pos_tax_proxy_ip + ':' + this.pos.config.mn_pos_tax_proxy_port;
                console.log('proxyURL: ', proxyURL);

                if (!this.currentOrder.get_client()) {
                    console.log('get_client: ', '---No2---');
                } else {
                    return super._isOrderValid();
                }
            }
        };
    
    Registries.Component.extend(PaymentScreen, CustomButtonPaymentScreen);

    return CustomButtonPaymentScreen;

});
