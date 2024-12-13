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
      const start = new Date();
      let messages = 0;
      let nextPageToken = null;
      let error_count = 0;
      do {
        let data = {}
        if (nextPageToken != null) {
          data = {limit: 500, pageToken: nextPageToken}
        } else {
          data = {limit: 500}
        }
        const callStart = new Date();
        const response = await api.action('interactor/gmail', 'email.get.batch', accountId, data);
        const callEnd = new Date();
        const callTime = callEnd - callStart;
        if (response.success) {
          messages += response.data.output.messages.length; // Add new items to the array
          nextPageToken = response.data.output.nextPageToken;  // Update the nextPageToken for the next iteration
          console.log(messages, callTime, response.data.output.messages[0].id, nextPageToken)
        } else {
          console.log("email.get.batch:", error_count, callTime, response.error, response.message)
          error_count++
        }
      } while (nextPageToken !== null && error_count < 100);
      const end = new Date();
      const timeDifference = end - start;
      console.log(`Synced ${messages} emails in ${timeDifference} milliseconds`);
      expect(messages).toBeGreaterThan(1001);
    } catch (error) {
      expect(error.message).toContain('Error executing action');
    }
  }, 36000000); // 10 hour timeout
});
