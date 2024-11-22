import {Client} from '../src';

const accountId = 'testUser'

describe('Client', () => {

  it('auth url', async () => {
    const api = new Client();
    try {
      const response = await api.authUrl('gmail', accountId);
      if (!response.success) {
        console.log(response.error)
      } else {
        console.log(response.data)
      }
      expect(response.success).toBe(true)
      expect(typeof response.data).toBe("string")
    } catch (error) {
      expect(error.message).toContain('Error fetching data');
    }
  });

  it('auth url with no accountId', async () => {
    const api = new Client();
    try {
      const response = await api.authUrl('gmail', null);
      expect(response.success).toBe(false)
      expect(response.error).toBe("accountId not provided")
    } catch (error) {
      expect(error.message).toContain('Error fetching data');
    }
  });

  it('auth url with random accountId', async () => {
    const api = new Client();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let accountId = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 8; i++) {
      accountId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    try {
      const response = await api.authUrl('gmail', accountId);
      if (!response.success) {
        console.log(response.error)
      }
      expect(response.success).toBe(true)
      expect(typeof response.data).toBe("string")
    } catch (error) {
      expect(error.message).toContain('Error fetching data');
    }
  });

  it('action with no data', async () => {
    const api = new Client();
    try {
      const response = await api.action('gmail', 'email.draft.list', accountId);
      if (!response.success) {
        console.log(response.error)
      }
      expect(response.success).toBe(true)
      expect(typeof response.data).toBe("array")
    } catch (error) {
      expect(error.message).toContain('Error fetching data');
    }
  });
});
