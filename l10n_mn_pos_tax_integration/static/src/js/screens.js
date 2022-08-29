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

            async _isOrderValid() {
                    
                var self = this;
                var order = this.currentOrder;

                if (!self.env.pos.config.mn_pos_tax_proxy_ip)
                    return true;

                // var mn_pos_tax_vatpayer = order.get_mn_pos_tax_vatpayer();
                var mn_pos_tax_vatpayer = order.get_client();

                var tickets = this.process_mn_pos_tax_tickets(mn_pos_tax_vatpayer);

                if (!tickets)
                    return false;

                var proxyURL = 'http://' + self.env.pos.config.mn_pos_tax_proxy_ip + ':' + self.env.pos.config.mn_pos_tax_proxy_port;                

                $.ajax({
                    type: 'POST',
                    async: false,
                    url: proxyURL + '/posapi/put',
                    // timeout: 500, // Implement it later & refer to pos_lock_screen module. var msgProcessing = _t('Processing your request...');
                    data: {
                        put1: tickets.ticket_vat === '' ? '' : JSON.stringify(tickets.ticket_vat),
                        put2: tickets.ticket_vatX === '' ? '' : JSON.stringify(tickets.ticket_vatX),
                        put3: tickets.ticket_vatZ === '' ? '' : JSON.stringify(tickets.ticket_vatZ),
                    }
                }).always(function(data, status, error) {
                    if (status != 'success') {
                        console.log('Sent Data:', tickets);
                        self.gui.show_popup('error',{
                            'title': _t('Error') + ' ' + status,
                            'body': _t('Please, check if PosApi Proxy is running!') + '\n' + error
                        });
                        return false;
                    }
                    else {
                        console.log('Sent Data:', tickets);     // TEMP
        
                        var result = JSON.parse(data);
        
                        console.log('Returned Data:', result);  // TEMP
        
                        if (!result || !result.length || result.length <= 0) {
                            console.log('Sent Data:', tickets);
                            console.log('Received Data:', result);
                            self.gui.show_popup('error',{
                                'title': _t('Error at tax system:'),
                                'body': _t('No data received from tax system.')
                            });
                            return false;
                        }
        
                        var errorCount = 0,
                            mn_pos_tax_order_lines;
                        for (var i = 0; i < result.length; i++) {
                            if (!result[i].success) {
                                errorCount++;
                                console.log('Ticket Count:', result.length);
                                console.log('Ticket No:', i+1);
                                console.log('Sent Data:', tickets);
                                console.log('Received Data for Ticket:', result[i]);
        
                                order.mn_pos_tax_errors.push({
                                    'mn_pos_tax_errorcode': result[i].errorCode,
                                    'mn_pos_tax_message': result[i].message,
                                    'mn_pos_tax_sentdata': JSON.stringify(tickets)
                                });
        
                                self.gui.show_popup('error',{
                                    'title': _t('Error at tax system:'),
                                    'body': result[i].errorCode + '\n' + result[i].message
                                });
        
                                console.log(result[i].errorCode + '\n' + result[i].message);
        
                                continue;
                            }
                            else {
                                if (result[i].lotteryWarningMsg) {
                                    console.log('Ticket Count:', result.length);
                                    console.log('Ticket No:', i+1);
                                    console.log('Sent Data:', tickets);
                                    console.log('Received Data for Ticket:', result[i]);
                                    console.log('Lottery Warning:', result[i].lotteryWarningMsg);
                                    self.gui.show_popup('error',{
                                        'title': _t('Error at tax system:'),
                                        'body': result[i].lotteryWarningMsg
                                    });
                                }
        
                                if (result[i].taxType === '1') {
                                    mn_pos_tax_order_lines = tickets.mn_pos_tax_lines_vat;
                                } else if (result[i].taxType === '2') {
                                    mn_pos_tax_order_lines = tickets.mn_pos_tax_lines_vatX;
                                } else if (result[i].taxType === '3') {
                                    mn_pos_tax_order_lines = tickets.mn_pos_tax_lines_vatZ;
                                }
        
                                var mn_pos_tax_order;
                                if (result[i].group) {
                                    var sub_bills = result[i].bills,
                                        mn_pos_tax_sub_orders = [],
                                        seller_tin, seller_tin_length, seller_tin_key;
                                    for (var j = 0; j < sub_bills.length; j++) {
                                        seller_tin = sub_bills[j].registerNo;
                                        seller_tin_length = seller_tin.length;
                                        if (seller_tin_length > 7) {
                                            seller_tin_key = seller_tin.slice(seller_tin_length - 8);
                                        }
                                        else {
                                            seller_tin_key = seller_tin;
                                        }
                                        seller_tin_key += '_' + sub_bills[j].taxType;
                                        mn_pos_tax_sub_orders.push({
                                            'mn_pos_tax_type': sub_bills[j].taxType,
                                            'mn_pos_tax_billtype': sub_bills[j].billType,
                                            'mn_pos_tax_billid': sub_bills[j].billId,
                                            'mn_pos_tax_billdate': new Date(sub_bills[j].date).toUTCString(),
                                            'mn_pos_tax_customerno': sub_bills[j].customerNo,
                                            'mn_pos_tax_customername': (mn_pos_tax_vatpayer ? mn_pos_tax_vatpayer.name : ''),
                                            'mn_pos_tax_order_lines': mn_pos_tax_order_lines[seller_tin_key],
        
                                            'mn_pos_tax_register_no': sub_bills[j].registerNo,
                                            'seller_id': sub_bills[j].seller_id,
                                        });
                                    }
        
                                    mn_pos_tax_order = {
                                        'dependency': 'batch_bill',
                                        'mn_pos_tax_sub_orders': mn_pos_tax_sub_orders,
        
                                        'mn_pos_tax_billtype': result[i].billType,
                                        'mn_pos_tax_billid': result[i].billId,
                                        'mn_pos_tax_billdate': new Date(result[i].date).toUTCString(),
                                        'mn_pos_tax_macaddress': result[i].macAddress,
                                        'mn_pos_tax_lotterywarningmsg': result[i].lotteryWarningMsg ? result[i].lotteryWarningMsg : '',
                                        'mn_pos_tax_input': '',
                                        'mn_pos_tax_output': '',
                                        'mn_pos_tax_info': '',
                                        'mn_pos_tax_lottery': result[i].lottery,            // only for printing
                                        'mn_pos_tax_qrdata': result[i].qrData,              // only for printing
                                        'mn_pos_tax_amount': parseFloat(result[i].amount),  // only for printing
                                    };
                                    order.mn_pos_tax_orders.push(mn_pos_tax_order);
                                }
                                else {
                                    mn_pos_tax_order = {
                                        'dependency': 'single_bill',
        
                                        'mn_pos_tax_type': result[i].taxType,
                                        'mn_pos_tax_billtype': result[i].billType,
                                        'mn_pos_tax_billid': result[i].billId,
                                        'mn_pos_tax_billdate': new Date(result[i].date).toUTCString(),
                                        'mn_pos_tax_customerno': result[i].customerNo,
                                        'mn_pos_tax_customername': (mn_pos_tax_vatpayer ? mn_pos_tax_vatpayer.name : ''),
                                        'mn_pos_tax_macaddress': result[i].macAddress,
                                        'mn_pos_tax_lotterywarningmsg': result[i].lotteryWarningMsg ? result[i].lotteryWarningMsg : '',
                                        'mn_pos_tax_input': '',
                                        'mn_pos_tax_output': '',
                                        'mn_pos_tax_info': '',
                                        'mn_pos_tax_lottery': result[i].lottery,            // only for printing
                                        'mn_pos_tax_qrdata': result[i].qrData,              // only for printing
                                        'mn_pos_tax_amount': parseFloat(result[i].amount),  // only for printing
                                        'mn_pos_tax_order_lines': mn_pos_tax_order_lines,
                                    };
                                    order.mn_pos_tax_orders.push(mn_pos_tax_order);
                                }
        
                                if (result[i].billType != '3' && !result[i].lottery) {
                                    // Input
                                    if (result[i].taxType === '1') {
                                        mn_pos_tax_order.mn_pos_tax_input = tickets.ticket_vat ? JSON.stringify(tickets.ticket_vat) : '';
                                    } else if (result[i].taxType === '2') {
                                        mn_pos_tax_order.mn_pos_tax_input = tickets.ticket_vatX ? JSON.stringify(tickets.ticket_vatX) : '';
                                    } else if (result[i].taxType === '3') {
                                        mn_pos_tax_order.mn_pos_tax_input = tickets.ticket_vatZ ? JSON.stringify(tickets.ticket_vatZ) : '';
                                    }
        
                                    // Output
                                    mn_pos_tax_order.mn_pos_tax_output = JSON.stringify(result[i]);
        
                                    // Info
                                    $.ajax({
                                        type: 'GET',
                                        async: false,
                                        url: proxyURL + '/posapi/getinfo',
                                    }).always(function(data, status, error) {
                                        mn_pos_tax_order.mn_pos_tax_info = data ? data : '';
                                    });
                                }
                            }
                        }
                    }
                });

                return super._isOrderValid();
            }
            process_mn_pos_tax_tickets(mn_pos_tax_vatpayer) {
                var order = this.currentOrder;

                // CustomerNo & BillType
                var billType = '', customerNo = '', reportMonth = '';

                // if (order.is_credit_sales()) {
                //     billType = '5';
                //     customerNo = (mn_pos_tax_vatpayer ? mn_pos_tax_vatpayer.vat : '1000000');
                // }
                // else
                if (mn_pos_tax_vatpayer) {
                    if (mn_pos_tax_vatpayer.vat) {
                        billType = '3';
                        customerNo = mn_pos_tax_vatpayer.vat;
                    }
                    else if (mn_pos_tax_vatpayer.ebarimt_id) {
                        billType = '1';
                        customerNo = mn_pos_tax_vatpayer.ebarimt_id;
                    }
                }
                else {
                    billType = '1';
                }

                if (this.env.pos.pos_session.mn_pos_tax_register_missed_orders) {
                    var date_missed_orders = new Date(this.env.pos.pos_session.mn_pos_tax_date_missed_orders);
                    reportMonth = date_missed_orders.getFullYear().toString() + '-' + getTwoDigitString(date_missed_orders.getMonth() + 1);
                }

                var orderlines_by_taxes = order.get_orderlines_by_taxes(),
                    order_lines, oline,
                    vat, cct, vat_total, cct_total,
                    amount_cash, amount_bank, amount_total,
                    mn_pos_tax_type, mn_pos_tax_details, ticket_lines,
                    mn_pos_tax_lines, mn_pos_tax_lines_vat = '', mn_pos_tax_lines_vatX = '', mn_pos_tax_lines_vatZ = '',
                    ticket, ticket_vat = '', ticket_vatX = '', ticket_vatZ = '', pos_config = this.env.pos.config,
                    sub_tickets = [], mn_pos_tax_lines_seller = {}, ticket_lines_seller,product, category,
                    seller, seller_id, seller_tin, seller_tin_key, seller_tin_pattern = /(^[А-ЯЁӨҮ]{2}[0-9]{8}$)|(^\d{7}$)/;
                for (var i = 0; i < orderlines_by_taxes.length; i++) {
                    // Ticket lines
                    mn_pos_tax_type = orderlines_by_taxes[i].taxtype;
                    order_lines = orderlines_by_taxes[i].orderlines;
                    vat_total = 0;
                    cct_total = 0;
                    amount_total = 0;
                    mn_pos_tax_lines = [];
                    ticket_lines = [];
                    ticket_lines_seller = {};
                    for (var j = 0; j < order_lines.length; j++) {
                        oline = order_lines[j];
                        if (oline.get_quantity() <= 0)
                            continue;

                        mn_pos_tax_details = oline.get_mn_pos_tax_details(mn_pos_tax_type);
                        cct = (mn_pos_tax_details.taxTypeDetails.cct ? mn_pos_tax_details.taxTypeDetails.cct : 0);
                        vat = (mn_pos_tax_details.taxTypeDetailsRaw.vat ? mn_pos_tax_details.taxTypeDetailsRaw.vat : 0);

                        seller_tin = false;
                        seller_id = false;
                        if (this.env.pos.company.mn_pos_tax_multi_sellers) {
                            seller_tin = this.env.pos.company.vat;
                            if (!seller_tin) {
                                this.gui.show_popup('error',{
                                    'title': _t('TIN is required'),
                                    'body': _t('Please, set TIN for your company.')
                                });
                                return false;
                            }

                            product = this.pos.db.get_product_by_id(mn_pos_tax_details.productId);
                            if (product.pos_categ_id) {
                                category = this.pos.db.get_category_by_id(product.pos_categ_id[0]);

                                if (category.mn_pos_tax_seller_id) {
                                    seller = this.pos.db.get_partner_by_id(category.mn_pos_tax_seller_id[0]);
                                    seller_tin = seller.vat;
                                    seller_id = seller.id;
                                    if (!seller_tin) {
                                        this.gui.show_popup('error',{
                                            'title': _t('TIN is required'),
                                            'body': _t('Please, set TIN for the following seller:') + '\n' + seller.name
                                        });
                                        return false;
                                    }
                                }
                            }

                            if (!seller_tin_pattern.test(seller_tin)) {
                                this.gui.show_popup('error',{
                                    'title': _t('Not Valid TIN'),
                                    'body': _t('This is not a valid TIN. It should be \n a company registry number (e.g. 1234567) or \n an individual\'s registry number (e.g. AA88112233)!')
                                });
                                return false;
                            }

                            if (seller_tin.length > 7) {
                                seller_tin_key = seller_tin.slice(seller_tin.length - 8);
                            }
                            else {
                                seller_tin_key = seller_tin;
                            }
                            seller_tin_key += '_' + mn_pos_tax_type.toString();

                            if (!mn_pos_tax_lines_seller[seller_tin_key]) {
                                mn_pos_tax_lines_seller[seller_tin_key] = [];
                            }
                            if (!ticket_lines_seller[seller_tin]) {
                                ticket_lines_seller[seller_tin] = {
                                    lines: [],
                                    seller_id: seller_id,
                                    vat_total: 0.0,
                                    cct_total: 0.0,
                                    amount_total: 0.0,
                                };
                            }

                            // Lines to store at backend
                            mn_pos_tax_lines_seller[seller_tin_key].push({
                                'product_id': mn_pos_tax_details.productId,
                                'product_name': mn_pos_tax_details.productName,
                                'product_code': mn_pos_tax_details.productCode,
                                'product_barcode': mn_pos_tax_details.barcode,
                                'product_uom': mn_pos_tax_details.uom_id,
                                'product_qty': mn_pos_tax_details.quantity,
                                'price_unit': mn_pos_tax_details.unitPrice,
                                'tax_ids': mn_pos_tax_details.taxIds,
                            });

                            // Lines to send to VATLS
                            ticket_lines_seller[seller_tin].lines.push({
                                'code': mn_pos_tax_details.productCode,
                                'name': mn_pos_tax_details.productName,
                                'measureUnit': mn_pos_tax_details.uom,
                                'qty': mn_pos_tax_details.quantity.toFixed(2),
                                'unitPrice': mn_pos_tax_details.unitPrice.toFixed(2),
                                'totalAmount': mn_pos_tax_details.priceWithTax.toFixed(2),
                                'cityTax': cct.toFixed(2),
                                'vat': vat.toFixed(2),
                                'barCode': mn_pos_tax_details.barcode
                            });
                            ticket_lines_seller[seller_tin].vat_total += vat;
                            ticket_lines_seller[seller_tin].cct_total += cct;
                            ticket_lines_seller[seller_tin].amount_total += mn_pos_tax_details.priceWithTax;
                        }
                        else {
                            // Lines to store at backend
                            mn_pos_tax_lines.push({
                                'product_id': mn_pos_tax_details.productId,
                                'product_name': mn_pos_tax_details.productName,
                                'product_code': mn_pos_tax_details.productCode,
                                'product_barcode': mn_pos_tax_details.barcode,
                                'product_uom': mn_pos_tax_details.uom_id,
                                'product_qty': mn_pos_tax_details.quantity,
                                'price_unit': mn_pos_tax_details.unitPrice,
                                'tax_ids': mn_pos_tax_details.taxIds,
                            });

                            // Lines to send to VATLS
                            ticket_lines.push({
                                'code': mn_pos_tax_details.productCode,
                                'name': mn_pos_tax_details.productName,
                                'measureUnit': mn_pos_tax_details.uom,
                                'qty': mn_pos_tax_details.quantity.toFixed(2),
                                'unitPrice': mn_pos_tax_details.unitPrice.toFixed(2),
                                'totalAmount': mn_pos_tax_details.priceWithTax.toFixed(2),
                                'cityTax': cct.toFixed(2),
                                'vat': vat.toFixed(2),
                                'barCode': mn_pos_tax_details.barcode
                            });
                            vat_total += vat;
                            cct_total += cct;
                            amount_total += mn_pos_tax_details.priceWithTax;
                        }
                    }

                    if (this.env.pos.company.mn_pos_tax_multi_sellers) {
                        for (var tin in ticket_lines_seller) {
                            ticket = {
                                'amount': ticket_lines_seller[tin].amount_total.toFixed(2),
                                'vat': ticket_lines_seller[tin].vat_total.toFixed(2),
                                'cashAmount': ticket_lines_seller[tin].amount_total.toFixed(2),
                                'nonCashAmount': '0.00',
                                'cityTax': ticket_lines_seller[tin].cct_total.toFixed(2),
                                'districtCode': pos_config.mn_pos_tax_districtcode,
                                //'posNo': pos_config.mn_pos_tax_posno,
                                'customerNo': customerNo,
                                //'billIdSuffix': '{B!D5FX}',
                                'billType': billType,
                                'taxType': mn_pos_tax_type.toString(),
                                'reportMonth': reportMonth,
                                'branchNo': pos_config.mn_pos_tax_branchno,
                                'stocks': ticket_lines_seller[tin].lines,

                                'registerNo': tin,
                                'seller_id': ticket_lines_seller[tin].seller_id,
                            };

                            vat_total += ticket_lines_seller[tin].vat_total;
                            cct_total += ticket_lines_seller[tin].cct_total;
                            amount_total += ticket_lines_seller[tin].amount_total;

                            sub_tickets.push(ticket);
                        }
                    }
                    else {
                        amount_cash = amount_total;
                        amount_bank = 0;
                        
                        amount_cash -= amount_bank;

                        // Ticket
                        ticket = {
                            'amount': amount_total.toFixed(2),
                            'vat': vat_total.toFixed(2),
                            'cashAmount': amount_cash.toFixed(2),
                            'nonCashAmount': amount_bank.toFixed(2),
                            'cityTax': cct_total.toFixed(2),
                            'districtCode': pos_config.mn_pos_tax_districtcode,
                            'posNo': pos_config.mn_pos_tax_posno,
                            'customerNo': customerNo,
                            'billIdSuffix': '{B!D5FX}',
                            'billType': billType,
                            'taxType': mn_pos_tax_type.toString(),
                            'reportMonth': reportMonth,
                            'branchNo': pos_config.mn_pos_tax_branchno,
                            'stocks': ticket_lines,
                        };

                        if (ticket.taxType === '1') {
                            ticket_vat = ticket;
                            mn_pos_tax_lines_vat = mn_pos_tax_lines;
                        }
                        else if (ticket.taxType === '2') {
                            ticket_vatX = ticket;
                            mn_pos_tax_lines_vatX = mn_pos_tax_lines;
                        }
                        else if (ticket.taxType === '3') {
                            ticket_vatZ = ticket;
                            mn_pos_tax_lines_vatZ = mn_pos_tax_lines;
                        }
                    }
                }

                if (this.env.pos.company.mn_pos_tax_multi_sellers) {
                    ticket = {
                        'group': true,
                        'vat': vat_total.toFixed(2),
                        'amount': amount_total.toFixed(2),
                        'billType': sub_tickets[0].billType,
                        'billIdSuffix': '{B!D5FX}',
                        'posNo': pos_config.mn_pos_tax_posno,
                        'bills': sub_tickets,
                    };

                    ticket_vat = ticket;
                    mn_pos_tax_lines_vat = mn_pos_tax_lines_seller;
                }

                return {
                    'ticket_vat': ticket_vat,
                    'mn_pos_tax_lines_vat': mn_pos_tax_lines_vat,

                    'ticket_vatX': ticket_vatX,
                    'mn_pos_tax_lines_vatX': mn_pos_tax_lines_vatX,

                    'ticket_vatZ': ticket_vatZ,
                    'mn_pos_tax_lines_vatZ': mn_pos_tax_lines_vatZ,
                };
            }
        };
    
    Registries.Component.extend(PaymentScreen, CustomButtonPaymentScreen);

    return CustomButtonPaymentScreen;

});
