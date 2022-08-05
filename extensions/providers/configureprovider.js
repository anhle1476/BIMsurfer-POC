import {App} from "../../apps/app.js"
import AbstractIssueService from "../issues/abstractissueservice.js";
import InMemoryIssueService from "../issues/inmemoryissueservice.js";
import IssueController from "../issues/issuecontroller.js";
import IssueViewer from "../issues/issueviewer.js";
import GlobalProvider from "./globalprovider.js";

// TODO: remove, this is POC only
const IS_DEBUG = true;

export function configureProvider(app) {
  // debugger;
  const provider = GlobalProvider.getInstance();
  if (IS_DEBUG) {
    window._provider = provider._objectContainer;
  }

  /**
   * APP
   */
  provider.register(App.name, app);

  /**
   * ISSUES
   */
  const issueService = new InMemoryIssueService();
  const issueController = new IssueController();
  const issueViewer = new IssueViewer();

  issueController.setApp(app);
  issueController.setIssueService(issueService);
  issueController.setIssueViewer(issueViewer);

  issueViewer.setController(issueController);
  
  provider.register(AbstractIssueService.name, issueService);
  provider.register(IssueController.name, issueController);
  provider.register(IssueViewer.name, issueViewer);
}