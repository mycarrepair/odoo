# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError

class PosConfig(models.Model):
    _inherit = 'pos.config'
    
    mn_pos_tax_proxy_ip = fields.Char('Proxy IP', size=45,
        help='IP address of the PosApi Proxy, e.g, 127.0.0.1 or 192.168.1.11.')
    mn_pos_tax_proxy_port = fields.Integer('Proxy Port',
        help='Port of the PosApi Proxy.')
    
    mn_pos_tax_branchno = fields.Char(string='Branch No', size=3, copy=False,
        help='Branch No should be 3 digits!')
    mn_pos_tax_posno = fields.Char(string='POS No', size=6, copy=False,
        help='POS No should be 6 digits!')
    mn_pos_tax_districtcode = fields.Selection(
        [
            ('01','Arhangai aimag'), ('02', 'Bayan-Ulgii aimag'), ('03', 'Bayanhongor aimag'),
            ('04','Bulgan aimag'), ('05', 'Govi-Altai aimag'), ('06', 'Dornogovi aimag'),
            ('07','Dornod aimag'), ('08', 'Dundgovi aimag'), ('09', 'Zavhan aimag'),
            ('10','Uvurhangai aimag'), ('11', 'Umnugovi aimag'), ('12', 'Suhbaatar aimag'),
            ('13','Selenge aimag'), ('14', 'Tuv aimag'), ('15', 'Uvs aimag'),
            ('16','Hovd aimag'), ('17', 'Huvsgul aimag'), ('18', 'Hentii aimag'),
            ('19','Darhan-Uul aimag'), ('20', 'Orhon aimag'), ('32', 'Govisumber aimag'),
            ('23','Han-Uul district'), ('24', 'Bayanzurh district'), ('25', 'Suhbaatar district'),
            ('26','Bayangol district'), ('27', 'Baganuur district'), ('28', 'Bagahangai district'),
            ('29','Nalaih district'), ('34', 'Songinohairhan district'), ('35', 'Chingeltei district')
        ], string='Province/District',
        help='Province or District where this POS belongs to')    
    
    mn_pos_tax_hide_lottery_after_first_print = fields.Boolean(string='Эхний хэвлэлтийн дараа сугалаа харагдахгүй', default=True)
    
    
    @api.constrains('mn_pos_tax_branchno')
    def _check_mn_pos_tax_branchno(self):
        for config in self:
            if config.mn_pos_tax_branchno:
                length = len(config.mn_pos_tax_branchno)
                if not (length == 3 and config.mn_pos_tax_branchno.isdigit()):
                    raise ValidationError(_('Branch No should be 3 digits, e.g, 001, 010 and 101.'))
    
    def _check_mn_pos_tax_posno(self):
        for config in self:
            length = len(config.mn_pos_tax_posno)
            if length < 4 or length > 6 or not config.mn_pos_tax_posno.isdigit():
                raise ValidationError(_('POS No should be 4 to 6 digits, e.g, 0001, 20003 and 300004.'))