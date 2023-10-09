import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class IndexController extends Controller {
  @service router;

  @action
  submit(event) {
    event.preventDefault();
    const url = event.target[0].value;
    const [, org, repo, id] =
      /github\.com\/(.+)\/(.+)\/actions\/runs\/(\d+)/.exec(url);

    this.router.transitionTo('view', org, repo, id);
  }
}
