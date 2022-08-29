odoo.define('es_mongolian_ebarimt.OrderReceipt', function(require) {
    'use strict';

    const OrderReceipt = require('point_of_sale.OrderReceipt');
    const Registries = require('point_of_sale.Registries');

    const EBarimtOrderReceipt = OrderReceipt => class extends OrderReceipt {
        get receiptEnv () {
            let receipt_render_env = super.receiptEnv;
            let order = this.env.pos.get_order();

            receipt_render_env.receipt.bill_type = "billType olgov";

            $('.mn_pos_tax_qrdata').each(function() {
                var canvas = $(this).children("canvas").get(0);
                var ecl = qrcodegen.QrCode.Ecc.LOW;
                var text = $(this).attr("qrdata");
                var segs = qrcodegen.QrSegment.makeSegments(text);
                var minVer = 7;
                var maxVer = 7;
                var mask = -1;
                var boostEcc = false;
                var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);
                var border = 1;
                var scale = 3;
                qr.drawCanvas(scale, border, canvas);
            });

            return receipt_render_env;
        }        
    }

    Registries.Component.extend(OrderReceipt, EBarimtOrderReceipt);

    return OrderReceipt;
});
