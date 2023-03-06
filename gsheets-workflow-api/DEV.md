## Development

### Setting up the development environment

First, install Python 3.9 and [Poetry](https://python-poetry.org/) on your system.

Then, install dependencies:

```
poetry install
```

This sets up a local Python environment with all the relevant dependencies, including the Development Tools listed further down in this readme.

Initialize the local configuration file:

```shell
cp .env.example .env
```

Configure the environment variables in `.env` as per the configuration section below.

The remaining commands in this readme assume you have activated the local Python environment by running:

```
poetry shell
```

(Note: This is equivalent of running `source <activate-venv-script>` if we were using `venv` instead of Poetry)

Now install the Git hooks that will make it harder to accidentally commit incorrectly formatted files:

```
pre-commit install
```

## Configuration

### For deploying to production

- `SURVEY_MONKEY_API_TOKEN` - A Survey Monkey app's Access Token, providing access to the surveys to import

### For local development

The deployed cloud functions will use the access credentials of the current user and operate on the spreadsheet that is currently opened. During local development, we have neither active credentials or an open spreadsheet, so the following additional configuration is necessary:

- `SERVICE_ACCOUNT_CREDENTIALS` - Service account credentials, base64-encoded, native to the above GCP project.
- `GS_COMBINED_SPREADSHEET_ID` - Spreadsheet ID of the production GS Combined Spreadsheet (Note: the service account needs access to this spreadsheet)
- `GS_DEV_COMBINED_SPREADSHEET_ID` - Spreadsheet ID of a development copy of the GS Combined Spreadsheet (Note: the service account needs access to this spreadsheet)

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

To test a function locally, run one of:

```shell
functions-framework --target "refresh_surveys_and_combined_listings" --debug
```

Then run:

```shell
curl -v http://0.0.0.0:8080/
```

### Developing gapminder-igno-survey-processing-gsheets-workflow-api using a notebook environment

Run the following to install a Jupyter kernel and opening the example Jupyter notebook:

```
poe install_kernel
jupyter-notebook exploration-notebook.py
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
