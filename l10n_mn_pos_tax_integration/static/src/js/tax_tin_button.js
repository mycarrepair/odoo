odoo.define('l10n_mn_pos_tax_integration.taxtinbutton', function (require) {
"use strict";

    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const { posbus } = require('point_of_sale.utils');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    class TaxTinButton extends PosComponent {
        IsRegisterTin() {
            console.log("Click Register TIN");
        }
        IsRegisterEbarimtId() {                
            console.log("Click IsRegister Ebarimt Id");
        }
    }
    TaxTinButton.template = 'TaxTinButton';
    Registries.Component.add(TaxTinButton);
    return TaxTinButton;
    
});