import BufferedContent from 'nilavu/mixins/buffered-content';
import {spinnerHTML} from 'nilavu/helpers/loading-spinner';
import Subscriptions from 'nilavu/models/subscriptions';
import {popupAjaxError} from 'nilavu/lib/ajax-error';
import {observes, computed} from 'ember-addons/ember-computed-decorators';
import NilavuURL from 'nilavu/lib/url';

export default Ember.Controller.extend(BufferedContent, {
    needs: ['application'],
    loading: false,
    formSubmitted: false,
    otpSubmitted: false,
    selectedTab: null,
    panels: null,
    showTop: false,
    resources: [],

    subscriber: Ember.computed.alias('model.subscriber'),
    mobavatar: Ember.computed.alias('model.mobavatar_activation'),

    @observes('subscriber')subscriberChecker: function() {
        console.log(this.get('subscriber'));
        console.log(this.get("mobavatar"));
    },

    _initPanels: function() {
        this.set('panels', []);
        this.set('selectedTab', 'monthly');
    }.on('init'),

    hourlySelected: function() {
        return this.selectedTab == 'hourly';
    }.property('selectedTab'),

    monthlySelected: function() {
        return this.selectedTab == 'monthly';
    }.property('selectedTab'),

    title: function() {
        return 'Subscriptions';
    }.property('model'),

    phoneNumber: function() {
        return "+61 422 101 421";
    }.property(),

    // _initPanels: function() {}.on('init'),

    orderedCatTypes: function() {
        const grouped_results = this.get('model.results');

        let otmap = [];

        for (var order in grouped_results) {
            otmap.push({order: order, cattype: grouped_results[order].get('firstObject.cattype').toLowerCase()});
        }

        return otmap;
    }.property('model.results'),

    regions: Ember.computed.alias('model.regions'),

    subRegionOption: function() {
        if (this.get('regions')) return this.get('regions.firstObject.name');

        return "";
    }.property('regions'),

    regionChanged: function() {
        if (!this.get('regions')) {
            return;
        }
        const _regionOption = this.get('subRegionOption');

        const fullFlavor = this.get('regions').filter(function(c) {
            if (c.name == _regionOption) {
                return c;
            }
        });
        if (fullFlavor.length > 0) {
            this.set('model.subresource', fullFlavor.get('firstObject'));
        }
    }.observes('model.subregion'),


    actions: {
        activate() {
            const self = this,
                attrs = this.getProperties('address', 'address2', 'city', 'state', 'zipcode', 'company');
            this.set('formSubmitted', true);
              NilavuURL.routeTo('/subscriptions/bill/activation');

            // return Nilavu.ajax("/subscriptions", {
            //     data: {
            //         address1: attrs.address,
            //         address2: attrs.address2,
            //         city: attrs.city,
            //         state: attrs.state,
            //         postcode: attrs.zipcode,
            //         companyname: attrs.company
            //     },
            //     type: 'POST'
            // }).then(function(result) {
            //     self.set('formSubmitted', false);
            //     var rs = result.subscriber;
            //     if (Em.isEqual(rs.result, "success")) {
            //         NilavuURL.routeTo('/subscriptions/bill/activation');
            //     } else {
            //       console.log(JSON.stringify(rs));
            //         self.notificationMessages.error(I18n.t(rs.error));
            //     }
            // });
        },

        verifyOTP() {
            const self = this,
                attrs = this.getProperties('otpNumber');
            this.set('otpSubmitted', true);
            return Nilavu.ajax("/verify/otp", {
                data: {
                    otp: attrs.otpNumber
                },
                type: 'POST'
            }).then(function(result) {
                self.set('otpSubmitted', false);
                self.setProperties({otpNumber: ''});

                if (!result.success) {
                    self.notificationMessages.error(I18n.t("user.activation.activate_phone_error"));
                }
            });
        }
    },

    hasError: Ember.computed.or('model.notFoundHtml', 'model.message'),

    noErrorYet: Ember.computed.not('hasError')

});