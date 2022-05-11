odoo.define('pos_Coupons.CouponButton', function (require) {
    "use strict";
    const { Gui } = require('point_of_sale.Gui');
    const PosComponent  = require('point_of_sale.PosComponent');
    const AbstractAwaitablePopup =    require('point_of_sale.AbstractAwaitablePopup');
    const Registries = require('point_of_sale.Registries');
    const ProductItem = require('point_of_sale.ProductItem');
    const ProductScreen = require('point_of_sale.ProductScreen');

    class TaxTinButton extends PosComponent{
        IsRegisterTin() {
            //Gui.showPopup("MnPosTaxTINPopupWidget", {
            //    title : this.env._t("Сонголтоо хийнэ үү"),
            //    confirmText: this.env._t("Цуцлах"),
            //});
            console.log("Click Register TIN");
        }
        IsRegisterEbarimtId() {
            //Gui.showPopup("MnPosTaxTINPopupWidget", {
            //    title : this.env._t("Сонголтоо хийнэ үү"),
            //    confirmText: this.env._t("Цуцлах"),
            //});
            console.log("Click IsRegister Ebarimt Id");
        }
    }
        
    //Add coupon button and set visibility
    PaymentScreen.addControlButton({
        component: TaxTinButton,
        condition: function() {
            return true;
        },
    });
    Registries.Component.add(TaxTinButton);

    return TaxTinButton;
   });