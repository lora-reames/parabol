import fetch from 'node-fetch'
import GitHubManager from 'parabol-client/utils/GitHubManager'
import {stringify} from 'querystring'
import {getRepositories} from './githubQueries/getRepositories'
import {getIssues} from './githubQueries/getIssues'
import {searchIssues} from './githubQueries/searchIssues'
import {
  GetRepositoriesQuery,
  GetIssuesQuery,
  SearchIssuesQuery
} from '../../server/types/typed-document-nodes'

interface OAuth2Response {
  access_token: string
  error: any
  scope: string
}

export interface GQLResponse<TData> {
  data?: TData
  errors?: any[]
}
interface GitHubCredentialError {
  message: string
  documentation_url: string
}
type GitHubResponse<TData> = GQLResponse<TData> | GitHubCredentialError

class GitHubServerManager extends GitHubManager {
  static async init(code: string) {
    return GitHubServerManager.fetchToken(code)
  }

  static async fetchToken(code: string) {
    const queryParams = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    }

    const uri = `https://github.com/login/oauth/access_token?${stringify(queryParams)}`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    const tokenJson = (await tokenRes.json()) as OAuth2Response
    const {access_token: accessToken, error, scope} = tokenJson
    if (error) {
      throw new Error(`GitHub: ${error}`)
    }
    const providedScope = scope.split(',')
    const matchingScope =
      new Set([...GitHubServerManager.SCOPE.split(','), ...providedScope]).size ===
      providedScope.length
    if (!matchingScope) {
      throw new Error(`GitHub Bad scope: ${scope}`)
    }
    return new GitHubServerManager(accessToken)
  }
  fetch = fetch

  private async serverPost<T>(body: string): Promise<GitHubResponse<T>> {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: this.headers,
      body
    })
    return await res.json()
  }
  constructor(accessToken: string) {
    super(accessToken)
  }

  async getRepositories() {
    const body = JSON.stringify({query: getRepositories, variables: {}})
    return this.serverPost<GetRepositoriesQuery>(body)
  }

  async getIssues(first = 10) {
    const body = JSON.stringify({query: getIssues, variables: {first}})
    return this.serverPost<GetIssuesQuery>(body)
  }

  async searchIssues(queryString: string, first = 10) {
    const body = JSON.stringify({query: searchIssues, variables: {queryString, first}})
    return await this.serverPost<SearchIssuesQuery>(body)
  }
}

export default GitHubServerManager
