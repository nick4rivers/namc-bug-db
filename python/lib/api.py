import os
import json
import requests
import boto3
from lib.logger import Logger


class QueryMonster:

    def __init__(self):
        self.jwt = None
        self.api_url = None

        # 2). Call the URL from config_obj to get the cognito user pool id
        self.gql_auth_obj = self.auth_query()

        # 3) Get the JWT we will need to make queries
        self.cognito_login()

    def cognito_login(self):
        """Log into cognito and retrieve the JWT token

        Arguments:
            auth_meta {[type]} -- [description]
            config_obj {[type]} -- [description]exit


        Returns:
            [type] -- [description]
        """
        client = boto3.client('cognito-idp')
        resp = client.admin_initiate_auth(
            UserPoolId=self.gql_auth_obj['userPool'],
            ClientId=self.gql_auth_obj['clientId'],
            AuthFlow='ADMIN_USER_PASSWORD_AUTH',
            AuthParameters={
                "USERNAME": os.environ['API_USER'],  # self.config_obj['apiUser'],
                "PASSWORD": os.environ['API_PASSWORD']  # self.config_obj['apiPass']
            }
        )
        self.jwt = resp['AuthenticationResult']['AccessToken']

    def run_query(self, query, variables):  # A simple function to use requests.post to make the API call. Note the json= section.
        log = Logger('API_QUERY')
        headers = {"Authorization": "Bearer " + self.jwt if self.jwt else 'Bearer NULL'}
        request = requests.post(os.environ['API_URL'], json={
            'query': query,
            'variables': variables
        }, headers=headers)

        if request.status_code == 200:
            resp_json = request.json()
            if 'errors' in resp_json and len(resp_json['errors']) > 0:
                log.error(json.dumps(resp_json, indent=4, sort_keys=True))
                # Authentication timeout: re-login and retry the query
                if len(list(filter(lambda err: 'You must be authenticated' in err['message'], resp_json['errors']))) > 0:
                    log.warning("Authentication timed out. Fetching new token...")
                    self.cognito_login()
                    log.warning("   done. Re-trying query...")
                    self.run_query(query, variables)
            else:
                # self.last_pass = True
                # self.retry = 0
                return request.json()
        else:
            raise Exception("Query failed to run by returning code of {}. {}".format(request.status_code, query))

    def auth_query(self):
        result = self.run_query(QueryMonster._GQL_Auth, {})  # Execute the query
        return result['data']['auth']  # Drill down the dictionary

    _GQL_Auth = """
        query Ping {
            auth{
            loggedIn
            userPool
            clientId
            region
            __typename
            }
        }
        """
