import {Client} from '../src';

const displayOAuthUrl = false
const accountId = 'testUser'
const accountIdAlt = 'testUserAlt'

describe('Client', () => {

  it('auth url', async () => {
    const api = new Client();
    try {
      const response = await api.authUrl('interactor/gmail', accountId);
      if (!response.success) {
        console.log(response.error, response.error)
      } else if (displayOAuthUrl) {
        console.log("OAUTH URL FOR testUser")
        console.log(response.data)
      }
      expect(response.success).toBe(true)
      expect(typeof response.data).toBe("string")
    } catch (error) {
      expect(error.message).toContain('Error getting auth url');
    }
  });

  it('auth url alternate', async () => {
    const api = new Client();
    try {
      const response = await api.authUrl('interactor/gmail', accountIdAlt);
      if (!response.success) {
        console.log(response.error, response.message)
      } else if (displayOAuthUrl) {
        console.log("OAUTH URL FOR testUserAlt")
        console.log(response.data)
      }
      expect(response.success).toBe(true)
      expect(typeof response.data).toBe("string")
    } catch (error) {
      expect(error.message).toContain('Error getting auth url');
    }
  });

  it('auth url with no accountId', async () => {
    const api = new Client();
    try {
      const response = await api.authUrl('interactor/gmail', null);
      expect(response.success).toBe(false)
      expect(response.error).toBe(400)
      expect(response.message).toBe("accountId not provided")
    } catch (error) {
      expect(error.message).toContain('Error getting auth url');
    }
  });

  it('auth url with random accountId', async () => {
    const api = new Client();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomAccountId = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      randomAccountId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    try {
      const response = await api.authUrl('interactor/gmail', randomAccountId);
      if (!response.success) {
        console.log(response.error, response.message)
      } else if (displayOAuthUrl) {
        console.log("OAUTH URL FOR ", randomAccountId)
        console.log(response.data)
      }
      expect(response.success).toBe(true)
      expect(typeof response.data).toBe("string")
    } catch (error) {
      expect(error.message).toContain('Error getting auth url');
    }
  });

  it('action gmail email.draft.list with no input should return array data', async () => {
    const api = new Client();
    try {
      const response = await api.action('interactor/gmail', 'email.draft.list', accountIdAlt);
      if (!response.success) {
        console.log('email.draft.list', response.error, response.message)
      }
      expect(response.success).toBe(true)
      expect(response.error).toBe(null)
      expect(Array.isArray(response.data.output.drafts)).toBe(true)
    } catch (error) {
      expect(error.message).toContain('Error executing action');
    }
  });

  it('action gmail email.draft.list with random user should return error', async () => {
    const api = new Client();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomAccountId = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      randomAccountId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    try {
      const response = await api.action('interactor/gmail', 'email.draft.list', randomAccountId);
      expect(response.success).toBe(false)
      expect(response.error).toBe(500)  // TODO: Should be 401?
      expect(response.message).toBe('Account has no tokens')
      expect(response.data).toBe(null)
    } catch (error) {
      expect(error.message).toContain('Error executing action');
    }
  });

  it('long living action call to get all emails', async () => {
    const api = new Client();
    try {
      const response = await api.action('interactor/gmail', 'email.list', accountId, {limit: 500});
      if (!response.success) {
        console.log("email.list:", response.error, response.message)
      }
      const email = await api.action('interactor/gmail', 'email.get', accountId, {message_id: response.data.output.messages[0].id});
      if (!email.success) {
        console.log("email.get:", email.error, email.message)
      }
      expect(email.data.output.id).toBe(response.data.output.messages[0].id)
      expect(email.success).toBe(true)
      expect(email.error).toBe(null)
      expect(typeof email.data).toBe('object')
      expect(response.success).toBe(true)
      expect(response.error).toBe(null)
      expect(Array.isArray(response.data.output.messages)).toBe(true)
      expect(response.data.output.messages.length).toBe(500)
      // for (let i = 0; i < response.data.output.length; i++) {
      //   console.log(response.data.output[i].id)
      //   const email = await api.action('interactor-team/gmail', 'email.get', accountId, {message_id: response.data.output[i].id});
      //   if (!response.success) {
      //     console.log(response.error, response.message)ñ
      //   }
      //   expect(email.data.output.id).toBe(response.data.output[i].id)
      //   expect(response.success).toBe(true)
      //   expect(response.error).toBe(null)
      //   expect(typeof response.data).toBe('object')
      // }
    } catch (error) {
      expect(error.message).toContain('Error executing action');
    }
  }, 3600000); // 1 hour timeout
});
