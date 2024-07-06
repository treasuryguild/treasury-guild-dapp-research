import { graphql } from "@octokit/graphql";

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
});

export async function fetchProjectBoardDetails(url: string, projectNumber: string) {
  // Remove the protocol (http, https) and split the URL by '/'
  const urlParts = url.replace(/(^\w+:|^)\/\//, '').split('/');
  
  if (urlParts.length < 2) {
    throw new Error('Invalid URL');
  }

  const owner = urlParts[1];
  const repoOrOrg = urlParts.length === 3 ? urlParts[2] : null;

  if (repoOrOrg) {
    // Repository level project
    const query = `
      query ($owner: String!, $repo: String!, $projectNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          projectV2(number: $projectNumber) {
            title
            fields(first: 10) {
              nodes {
                ... on ProjectV2FieldCommon {
                  name
                  dataType
                }
              }
            }
            items(first: 100) {
              nodes {
                content {
                  ... on Issue {
                    title
                    body
                    number
                    milestone {
                      title
                    }
                    labels(first: 5) {
                      nodes {
                        name
                      }
                    }
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldNumberValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      number
                    }
                    ... on ProjectV2ItemFieldTextValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      text
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      date
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      name
                    }
                    ... on ProjectV2ItemFieldIterationValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      iterationId
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data: any = await graphqlWithAuth(query, {
        owner,
        repo: repoOrOrg,
        projectNumber: parseInt(projectNumber, 10),
      });

      return data.repository.projectV2;
    } catch (error) {
      console.error("Error fetching project board details:", error);
      throw error;
    }
  } else {
    // Organization level project
    const query = `
      query ($orgName: String!, $projectNumber: Int!) {
        organization(login: $orgName) {
          projectV2(number: $projectNumber) {
            title
            fields(first: 10) {
              nodes {
                ... on ProjectV2FieldCommon {
                  name
                  dataType
                }
              }
            }
            items(first: 100) {
              nodes {
                content {
                  ... on Issue {
                    title
                    body
                    number
                    milestone {
                      title
                    }
                    labels(first: 5) {
                      nodes {
                        name
                      }
                    }
                  }
                }
                fieldValues(first: 10) {
                  nodes {
                    ... on ProjectV2ItemFieldNumberValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      number
                    }
                    ... on ProjectV2ItemFieldTextValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      text
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      date
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      name
                    }
                    ... on ProjectV2ItemFieldIterationValue {
                      field {
                        ... on ProjectV2FieldCommon {
                          name
                        }
                      }
                      iterationId
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const data: any = await graphqlWithAuth(query, {
        orgName: owner,
        projectNumber: parseInt(projectNumber, 10),
      });

      return data.organization.projectV2;
    } catch (error) {
      console.error("Error fetching project board details:", error);
      throw error;
    }
  }
}
