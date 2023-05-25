## Development

### Setting up the development environment

First, install Python 3.9 and [Poetry](https://python-poetry.org/) on your system.

Then, install dependencies:

```
poetry install
```

This sets up a local Python environment with all the relevant dependencies, including the Development Tools listed further down in this readme.

The remaining commands in this readme assume you have activated the local Python environment by running:

```
poetry shell
```

(Note: This is equivalent of running `source <activate-venv-script>` if we were using `venv` instead of Poetry)

Now install the Git hooks that will make it harder to accidentally commit incorrectly formatted files:

```
pre-commit install
```

## Local Configuration

Initialize the local configuration file:

```shell
cp .env.example .env
```

Configure the environment variables in `.env` as per the configuration sections below.

### For deploying to production

- `GCP_PROJECT` - GCP project id to use for deployment.
- `GCP_REGION` - GCP region to use for deployment.

### For running in production

- `SURVEY_MONKEY_API_TOKEN` - A Survey Monkey app's Access Token, providing access to the surveys to import

### For local development

The deployed cloud functions will use the access credentials of the current user and operate on the spreadsheet that is currently opened. During local development, we have neither active credentials or an open spreadsheet, so the following additional configuration is necessary:

- `SERVICE_ACCOUNT_CREDENTIALS` - Service account credentials, base64-encoded, native to the above GCP project (see below for instructions on how to obtain these)
- `GS_COMBINED_SPREADSHEET_ID` - Spreadsheet ID of the production GS Combined Spreadsheet (Note: the service account needs access to this spreadsheet)
- `GS_DEV_COMBINED_SPREADSHEET_ID` - Spreadsheet ID of a development copy of the GS Combined Spreadsheet (Note: the service account needs access to this spreadsheet)

## Cloud Configuration

For the GCP project that will be used for deployment:

1. Use the [GCP API Dashboard](https://console.cloud.google.com/apis/dashboard) to enable the Google APIs necessary for the add-on:
- Google Sheets API
- Google Drive API
- Secret Manager API
- Cloud Functions API
- Cloud Build API
- IAM Service Account Credentials API

2. Configure the OAuth consent screen: [https://console.cloud.google.com/apis/credentials/consent](). The current GCP Oauth assets (logo) was created using [this Figma project](https://www.figma.com/file/m7vuUFRdMkrTwnO1whFfi7/Google-Marketplace-assets?node-id=0%3A1&t=dgKGpR2Tdz7wsVAS-0).

3. In the Apps Script editor for the deployed Google Apps Script (the spreadsheet to which [../gsheets-addon]() is deployed), go to Project Settings -> Google Cloud Platform (GCP) Project and Change Project to the relevant project.

4. Give all users of the gapminder.org domain permission to invoke the cloud function:

```shell
source .env
gcloud functions add-iam-policy-binding refresh_surveys_and_combined_listings \
--project $GCP_PROJECT \
--region $GCP_REGION \
--member="domain:gapminder.org" \
--role=roles/cloudfunctions.invoker
```

Note: The above has already been configured for our production GCP project, but instructions are supplied here to be able to set up a new project, e.g. for testing purposes or similar.

### Obtaining service account credentials, base64-encoded

- Visit the service account's key management page in GCP (the account was created using [these docs](https://cloud.google.com/iam/docs/creating-managing-service-accounts#creating))
- `Add new` -> `Create new key` -> Choose `JSON` key type - This will trigger a download of the JSON credentials
- On a Mac, run the following script to base64-encode, remove newlines and put the result in the clipboard:
```bash
cat path/to/file.json | openssl base64 | tr -d '\n' | pbcopy
```
- Paste the contents of the clipboard to wherever the `SERVICE_ACCOUNT_CREDENTIALS` environment variable is configured.

### Installing new dependencies added by collaborators

When new dependencies gets added/updated/removed (in `pyproject.toml`) by collaborators, you need to run the following to update the correct environment with the latest dependencies:

```
poetry update
```

### Run tests, formatters and linters

Run tests, formatters and linters (using the currently active Python version):

```
poe test
```

#### Tests package

The package tests themselves are _outside_ of the main library code, in
the directory aptly named `tests`.

#### Running tests only

Run tests:

```
poe pytest
```

Run a specific test:

```
pytest tests/test_lib_import_statement.py
```

### Testing cloud functions locally

To test the refresh_surveys_and_combined_listings cloud function locally, run:

```shell
functions-framework --target "refresh_surveys_and_combined_listings" --debug
```

Then invoke it:

```shell
curl -v --location --request POST 'http://0.0.0.0:8080/' \
--header 'accept: application/json' \
--header 'Content-Type: application/json' \
--data-raw '{
  "accessToken": "foo",
  "spreadsheetId": "bar"
}'
```

Note that this makes little sense unless you already have snooped an active user access token from somewhere, but if you do, it is a good way to check if a code change has the desired effect before deploying it to production.

## Deploy

> **_NOTE:_** You need to be logged in and your GCP user account needs at least the `Cloud Functions Developer`, `Service Account User` and `Logs Viewer` roles to be able to create, deploy and debug the cloud functions.

Additionally, at least once, a project admin (with at least the `Project IAM Admin` and `Secrets Manager Admin` roles) needs to set the necessary secrets and give cloud functions read-access to those secrets:

```shell
source .env
echo -n "$SURVEY_MONKEY_API_TOKEN" | gcloud secrets create survey-monkey-api-token --data-file=- --replication-policy automatic --project $GCP_PROJECT
gcloud projects add-iam-policy-binding $GCP_PROJECT --member="serviceAccount:$GCP_PROJECT@appspot.gserviceaccount.com" --role='roles/secretmanager.secretAccessor'
```

Then, everytime existing secrets change:

```shell
source .env
echo -n "$SURVEY_MONKEY_API_TOKEN" | gcloud secrets versions add survey-monkey-api-token --data-file=- --project $GCP_PROJECT
```

To deploy:

```shell
poe deploy
```

To troubleshoot the functionality of the cloud functions, check the logs at:

```shell
poe logs
```

Note that environment variables for the GCP cloud function needs to be configured as per the configuration section above.

### Developing gapminder-igno-survey-processing-gsheets-workflow-api using a notebook environment

Run the following to install a Jupyter kernel and opening the example Jupyter notebook:

```
poe install_kernel
jupyter-notebook notebooks/exploration-notebook.py
```

After selecting the `gapminder-igno-survey-processing-gsheets-workflow-api` kernel in Jupyter you should be able to import files from `lib`, e.g.:

```
from lib.config import read_config()
read_config()
```

### Updating Pydantic models to match SurveyMonkey responses

We use Pydantic models for the API responses, so that our code reliably can expect a specific reponse structure.

SurveyMonkey does not provide Pydantic models for their API, so we maintain our own on a best effort basis.

The upper part of the exploration notebook has code to fetch all available information about all surveys, question rollups and surveys responses and print them as JSON arrays.

The initial Pydantic models (question_rollup.py, response.py, survey.py in lib.survey_monkey) were created by copying these printouts one by one to https://jsontopydantic.com/ to generate corresponding Pydantic models.

These initial models will probably break when there is a new yet unseen structure in the SurveyMonkey API responses. Use the official API documentation at https://github.com/SurveyMonkey/public_api_docs/ and possibly also the SurveyMonkey V3 API Postman collection at https://documenter.getpostman.com/view/3967924/RW1Yq1Vq to manually update the Pydantic models.

### Development setup

#### Principles

* Simple for developers to get up-and-running (`poetry`, `poethepoet`)
* Unit tests with test coverage reports (`pytest`, `tox`)
* Consistent style (`isort`, `black`, `flake8`)
* Prevent use of old Python syntax (`pyupgrade`)
* Require type hinting (`mypy`)

#### Development tools

* [`poetry`](https://python-poetry.org/) for dependency management
* [`poethepoet`](https://github.com/nat-n/poethepoet) as local task runner
* [`isort`](https://github.com/PyCQA/isort), [`black`](https://github.com/psf/black), [`pyupgrade`](https://github.com/asottile/pyupgrade) and [`flake8`](https://flake8.pycqa.org/en/latest/) linting
* [`mypy`](https://mypy.readthedocs.io/en/stable/) for type hinting
* [`pre-commit`](https://pre-commit.com/) to run linting / dependency checks
* [`pytest`](https://docs.pytest.org/), and [`tox`](https://tox.wiki) to run tests
* [`tox`]() and [GitHub Actions](https://github.com/features/actions) for running tests against different Python versions
* [`editorconfig`](https://editorconfig.org/) for telling the IDE how to format tabs/newlines etc
