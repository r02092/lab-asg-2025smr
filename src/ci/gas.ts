(global as any).doGet = (e: GoogleAppsScript.Events.DoGet) => {
	return ContentService.createTextOutput(
		LanguageApp.translate(e.parameter.t, "en", "ja"),
	);
};
