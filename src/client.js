import axios from 'axios';

class Client {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL: baseURL || 'http://console.interactor.com/api/v1/connector/',
    });
  }

  async action(connectorName, actionName, accountId, data) {
    let attempts = 0
    let delay = 1000
    const maxDelay = 60000
    while (attempts < 10) {
      attempts++;
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
            error: null,
            message: null
          }
        } else {
          return {
            success: false,
            data: response.data,
            error: response.status,
            message: response.data
          }
        }
      } catch (error) {
        switch (error.response.data.error) {
          case 'econnrefused': // API call to external service is refused
            await new Promise(resolve => setTimeout(resolve, delay));
          default:
            if (error.response.status == 500 && error.response.data.error == "Connector token is unauthorized") {
              await new Promise(resolve => setTimeout(resolve, delay));
            } else if (error.response.status == 500 && error.response.data.error == "Timeout") {
              await new Promise(resolve => setTimeout(resolve, delay));
            } else {
              return {
                success: false,
                data: null,
                error: error.response.status,
                message: error.response.data.error
                // TODO: Change this to a more generic error message as below
                // error: 'failed to execute action for the user provided'
              };
            }
        }
      }
      console.log(`Retrying in ${delay}ms...`);
      delay = Math.min(delay * 2, maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // TODO: Check if function needs to be provided for non-user system account. Not our current target market
  async authUrl(connectorName, accountId) {
    try {
      if (accountId == null) {
        return {
          success: false,
          data: null,
          error: 400,
          message: "accountId not provided"
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
            error: null,
            message: null
          }
        } else {
          return {
            success: false,
            data: response.data,
            error: response.status,
            message: response
          }
        }
      }
    } catch (error) {
      // console.log(error)
      // throw new Error('Error posting data: ' + error.message);
      return {
        success: false,
        data: null,
        error: 400,
        message: error.response.data.error
        // TODO: Change this to a more generic error message as below
        // error: 'failed to get authorization url for the user provided'
      };
    }
  }
}

export default Client;
