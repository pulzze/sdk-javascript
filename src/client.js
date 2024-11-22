import axios from 'axios';

class Client {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL: baseURL || 'http://localhost:1290/v1/connector/',
    });
  }

  async action(connectorName, actionName, accountId, data) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': process.env.INTERACTOR_API_KEY
      }
      const endpoint = connectorName + '/action/' + actionName + '/execute?accountId=' + accountId
      const response = await this.client.post(endpoint, data, { headers });
      if (response.status < 299) {
        return {
          success: true,
          data: response.data,
          error: null
        }
      } else {
        return {
          success: false,
          data: response.data,
          error: response.error
        }
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.response.data.error
        // TODO: Change this to a more generic error message as below
        // error: 'failed to execute action for the user provided'
      };
    }
  }

  // TODO: Check if function needs to be provided for non-user system account. Not our current target market
  async authUrl(connectorName, accountId) {
    try {
      if (accountId == null) {
        return {
          success: false,
          data: null,
          error: "accountId not provided"
        }
      } else {
        const headers = {
          'Content-Type': 'application/json',
          'x-api-key': process.env.INTERACTOR_API_KEY
        }
        const endpoint = connectorName + '/auth-url?accountId=' + accountId
        const response = await this.client.get(endpoint, { headers });
        if (response.status < 299) {
          return {
            success: true,
            data: response.data,
            error: null
          }
        } else {
          return {
            success: false,
            data: response.data,
            error: null
          }
        }
      }
    } catch (error) {
      // console.log(error)
      // throw new Error('Error posting data: ' + error.message);
      return {
        success: false,
        data: null,
        error: error.response.data.error
        // TODO: Change this to a more generic error message as below
        // error: 'failed to get authorization url for the user provided'
      };
    }
  }
}

export default Client;
