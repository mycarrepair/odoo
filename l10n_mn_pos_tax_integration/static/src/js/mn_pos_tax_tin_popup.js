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
            useListener('click-product', this._clickProduct);
        }
        //To get coupon products category
        get productsToDisplay() {
            return this.env.pos.db.get_product_by_category(this.env.pos.config.category_id[0]);
        }
        get currentOrder() {
            return this.env.pos.get_order();
        }
        //get products details in orderlines when clicking on popup product
        async _clickProduct(event) {
            if (!this.currentOrder) {
                this.env.pos.add_new_order();
            }
            console.log("bbb")
            const product = event.detail;
            let price_extra = 0.0;
            let description, packLotLinesToEdit;
            // Add the product after having the extra information.
            this.currentOrder.add_product(product, {
                description: description,
            });
        }
    }
    
    //Create products popup
    MnPosTaxTINPopup.template = 'MnPosTaxTINPopup';
    MnPosTaxTINPopup.defaultProps = {
        confirmText: 'Ok',
        cancelText: 'Cancel',
        title: 'Сонголтоо хийнэ үү',
        body: '',
    };

    Registries.Component.add(MnPosTaxTINPopup);
    
    return MnPosTaxTINPopup;
});
