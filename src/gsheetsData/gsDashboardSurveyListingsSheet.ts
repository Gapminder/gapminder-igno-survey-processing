/**
 * This file contains hard coded sheet ids, worksheet ids and other
 * mappings that must be reflected by the underlying source data
 */
/* tslint:disable:object-literal-sort-keys */

/**
 * @hidden
 */
export const gsDashboardSurveyListingsSheetHeaders = [
  "Survey ID",
  "Survey Name & Link",
  "Status",
  "Created",
  "Last run",
  "Next run",
  "URL"
];

/**
 * @hidden
 */
export const gsDashboardSurveyListingsSheetName =
  "gs_dashboard_surveys_listing";

/**
 * @hidden
 */
export interface GsDashboardSurveyListingsEntry {
  survey_id: any;
  survey_name_and_link: any;
  status: any;
  created: any;
  last_run: any;
  next_run: any;
  url: any;
}

/**
 * @hidden
 */
export const gsDashboardSurveyListingsSheetValueRowToGsDashboardSurveyListingsEntry = (
  gsDashboardSurveyListingsSheetRow: any[]
): GsDashboardSurveyListingsEntry => {
  return {
    survey_id: gsDashboardSurveyListingsSheetRow[0],
    survey_name_and_link: gsDashboardSurveyListingsSheetRow[1],
    status: gsDashboardSurveyListingsSheetRow[2],
    created: gsDashboardSurveyListingsSheetRow[3],
    last_run: gsDashboardSurveyListingsSheetRow[4],
    next_run: gsDashboardSurveyListingsSheetRow[5],
    url: gsDashboardSurveyListingsSheetRow[6]
  };
};
