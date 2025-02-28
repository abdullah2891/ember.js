import { moduleFor, ApplicationTestCase, RenderingTestCase, runTask } from 'internal-test-helpers';

import Controller from '@ember/controller';
import { set } from '@ember/-internals/metal';
import { LinkComponent } from '@ember/-internals/glimmer';

moduleFor(
  'link-to component (basic tests)',
  class extends ApplicationTestCase {
    visitWithDeprecation(path, deprecation) {
      let p;

      expectDeprecation(() => {
        p = this.visit(path);
      }, deprecation);

      return p;
    }

    ['@test should be able to be inserted in DOM when the router is not present']() {
      this.addTemplate('application', `{{#link-to 'index'}}Go to Index{{/link-to}}`);

      return this.visit('/').then(() => {
        this.assertText('Go to Index');
      });
    }

    ['@test re-renders when title changes']() {
      let controller;

      this.addTemplate('application', '{{link-to title routeName}}');
      this.add(
        'controller:application',
        Controller.extend({
          init() {
            this._super(...arguments);
            controller = this;
          },
          title: 'foo',
          routeName: 'index',
        })
      );

      return this.visit('/').then(() => {
        this.assertText('foo');
        runTask(() => set(controller, 'title', 'bar'));
        this.assertText('bar');
      });
    }

    ['@test re-computes active class when params change'](assert) {
      let controller;

      this.addTemplate('application', '{{link-to "foo" routeName}}');

      this.add(
        'controller:application',
        Controller.extend({
          init() {
            this._super(...arguments);
            controller = this;
          },
          routeName: 'index',
        })
      );

      this.router.map(function() {
        this.route('bar', { path: '/bar' });
      });

      return this.visit('/bar').then(() => {
        assert.equal(this.firstChild.classList.contains('active'), false);
        runTask(() => set(controller, 'routeName', 'bar'));
        assert.equal(this.firstChild.classList.contains('active'), true);
      });
    }

    ['@test escaped inline form (double curlies) escapes link title']() {
      this.addTemplate('application', `{{link-to title 'index'}}`);
      this.add(
        'controller:application',
        Controller.extend({
          title: '<b>blah</b>',
        })
      );

      return this.visit('/').then(() => {
        this.assertText('<b>blah</b>');
      });
    }

    ['@test escaped inline form with (-html-safe) does not escape link title'](assert) {
      this.addTemplate('application', `{{link-to (-html-safe title) 'index'}}`);
      this.add(
        'controller:application',
        Controller.extend({
          title: '<b>blah</b>',
        })
      );

      return this.visit('/').then(() => {
        this.assertText('blah');
        assert.equal(this.$('b').length, 1);
      });
    }

    ['@test unescaped inline form (triple curlies) does not escape link title'](assert) {
      this.addTemplate('application', `{{{link-to title 'index'}}}`);
      this.add(
        'controller:application',
        Controller.extend({
          title: '<b>blah</b>',
        })
      );

      return this.visit('/').then(() => {
        this.assertText('blah');
        assert.equal(this.$('b').length, 1);
      });
    }

    ['@test able to safely extend the built-in component and use the normal path']() {
      this.addComponent('custom-link-to', {
        ComponentClass: LinkComponent.extend(),
      });
      this.addTemplate('application', `{{#custom-link-to 'index'}}{{title}}{{/custom-link-to}}`);
      this.add(
        'controller:application',
        Controller.extend({
          title: 'Hello',
        })
      );

      return this.visit('/').then(() => {
        this.assertText('Hello');
      });
    }

    ['@test [GH#13432] able to safely extend the built-in component and invoke it inline']() {
      this.addComponent('custom-link-to', {
        ComponentClass: LinkComponent.extend(),
      });
      this.addTemplate('application', `{{custom-link-to title 'index'}}`);
      this.add(
        'controller:application',
        Controller.extend({
          title: 'Hello',
        })
      );

      return this.visit('/').then(() => {
        this.assertText('Hello');
      });
    }
  }
);

moduleFor(
  'link-to component (without router??!)',
  class extends RenderingTestCase {
    ['@test should be able to be inserted in DOM when the router is not present - block']() {
      this.render(`{{#link-to 'index'}}Go to Index{{/link-to}}`);

      this.assertText('Go to Index');
    }

    ['@test should be able to be inserted in DOM when the router is not present - inline']() {
      this.render(`{{link-to 'Go to Index' 'index'}}`);

      this.assertText('Go to Index');
    }
  }
);
