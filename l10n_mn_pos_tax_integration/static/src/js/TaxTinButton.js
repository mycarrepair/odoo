odoo.define('l10n_mn_pos_tax_integration.taxtinbutton', function (require) {
"use strict";

    const { Gui } = require('point_of_sale.Gui');
    const PosComponent  = require('point_of_sale.PosComponent');
    const AbstractAwaitablePopup =    require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');
    const ProductItem = require('point_of_sale.ProductItem');
    const PaymentScreen = require('point_of_sale.PaymentScreen');

    const TaxTinButton = (PaymentScreen) =>
        class extends PaymentScreen {
            constructor() {
                super(...arguments);
            }
            IsRegisterTin() {
                console.log("Click Register TIN");
            }
            IsRegisterEbarimtId() {                
                console.log("Click IsRegister Ebarimt Id");
            }
        }
    
    Registries.Component.extend(PaymentScreen, TaxTinButton);

    return TaxTinButton;
});