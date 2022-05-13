/*external modules*/
import chai from 'chai';
/*lib*/
import Mailjet from '../../lib/index.js';
/*utils*/
import { isUndefined } from '../../lib/utils/index.js';
/*other*/

const expect = chai.expect;

describe('SMS Basic Usage', () => {
  const API_TOKEN = process.env.MJ_API_TOKEN;

  let client;
  before(function () {
    if(isUndefined(API_TOKEN)) {
      this.skip();
    } else {
      const smsConfig = {
        version: 'v4'
      };
      client = Mailjet.smsConnect(API_TOKEN, { config: smsConfig });
    }
  });

  describe('connection', () => {

    it('creates instance of the client', () => {
      [
        new Mailjet({ apiToken: API_TOKEN }),
        Mailjet.smsConnect(API_TOKEN)
      ].forEach(connectionType => {
        expect(connectionType.apiToken).to.equal(API_TOKEN);
      });
    });

    it('creates an instance of the client wiht options', () => {
      const smsConfig = {
        version: 'v4'
      };

      [
        new Mailjet({ apiToken: API_TOKEN, config: smsConfig }),
        Mailjet.smsConnect(API_TOKEN, { config: smsConfig })
      ].forEach(connection => {
        expect(connection).to.have.property('apiToken', API_TOKEN);
        expect(connection.config).to.have.property(
          'version',
          smsConfig.version
        );
      });
    });

  });

  describe('method call', () => {

    describe('get', function () {
      this.timeout(3500);

      let smsGet;
      before(() => {
        smsGet = client.get('sms');
      });

      it('calls retrieve sms action count with parameters', async () => {
        const countRequest = smsGet.action('count');

        try {
          const response = await countRequest
            .request({ FromTS: +new Date, ToTS: +new Date });

          expect(response.body).to.be.a('object');
          expect(response.body.count).to.equal(0);
        } catch (err) {
          expect(err.ErrorMessage).to.equal(undefined);
        }
      });

      it('retirieve list of messages', async () => {
        try {
          const response = await smsGet
            .request({ FromTS: +new Date, ToTS: +new Date });

          expect(response.body).to.be.a('object');
          expect(response.body.Data.length).to.equal(0);
        } catch (err) {
          expect(err).to.equal(undefined);
        }
      });

    });

    describe('post', function () {
      this.timeout(3500);

      it('export sms statisitcs action with timestamp bigger than one year', async () => {
        try {
          const response = await client
            .post('sms')
            .action('export')
            .request({
              FromTS: 1033552800,
              ToTS: 1033574400
            });

          expect(response.body).to.be.a('object');
        } catch (err) {
          expect(err.statusCode).to.equal(400);
          expect(err.ErrorMessage).to.equal('FromTS must not be older than one year.');
          expect(err.message).to.include('Unsuccessful');
        }
      });

    });

  });

});