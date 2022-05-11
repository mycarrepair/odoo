odoo.define('l10n_mn_pos_tax_integration.MnPosTaxTINPopup', function (require) {
    "use strict";

    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');
    const PosComponent = require('point_of_sale.PosComponent');
    const ControlButtonsMixin = require('point_of_sale.ControlButtonsMixin');
    const NumberBuffer = require('point_of_sale.NumberBuffer');
    const { useListener } = require('web.custom_hooks');
    const { onChangeOrder, useBarcodeReader } = require('point_of_sale.custom_hooks');
    const { useState } = owl.hooks;

    class MnPosTaxTINPopup extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
        }
        click_confirm() {
            console.log('click_confirm: ', click_confirm);
        }
    }
    
    //Create payment popup
    MnPosTaxTINPopup.template = 'MnPosTaxTINPopup';
    MnPosTaxTINPopup.defaultProps = {
        confirmText: 'Ok',
        cancelText: 'Cancel',
        title: 'Регитер оруулна уу?',
        body: '',
    };

    Registries.Component.add(MnPosTaxTINPopup);
    
    return MnPosTaxTINPopup;
});
