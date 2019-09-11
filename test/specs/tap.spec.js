
const {createRequest, createEnterRequest, createResponse} = require('../protocol');

describe('tap', () => {
  it('tap by title (button without payload)', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse({
      response: {buttons: [
        {title: 'Да'}
      ]}
    });

    const reqBody2 = createRequest({
      session: {new: false, message_id: 2},
      request: {command: 'Да', original_utterance: 'Да', type: 'SimpleUtterance'}
    });
    const resBody2 = createResponse();

    const scope = nock('http://localhost')
      .post('/', reqBody1)
      .reply(200, resBody1)
      .post('/', reqBody2)
      .reply(200, resBody2);

    const user = new User('http://localhost');
    await user.enter();
    const response = await user.tap('Да');

    scope.done();
    assert.deepEqual(user.response, response);
  });

  it('tap by title (button with payload)', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse({
      response: {buttons: [
        {title: 'Да', payload: {foo: 1}}
      ]}
    });

    const reqBody2 = createRequest({
      session: {new: false, message_id: 2},
      request: {command: 'Да', original_utterance: 'Да', type: 'ButtonPressed', payload: {foo: 1}}
    });
    const resBody2 = createResponse();

    const scope = nock('http://localhost')
      .post('/', reqBody1)
      .reply(200, resBody1)
      .post('/', reqBody2)
      .reply(200, resBody2);

    const user = new User('http://localhost');
    await user.enter();
    await user.tap('Да');

    scope.done();
  });

  it('tap by regexp', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse({
      response: {buttons: [
          {title: 'Да'}
        ]}
    });

    const reqBody2 = createRequest({
      session: {new: false, message_id: 2},
      request: {command: 'Да', original_utterance: 'Да', type: 'SimpleUtterance'}
    });
    const resBody2 = createResponse();

    const scope = nock('http://localhost')
      .post('/', reqBody1)
      .reply(200, resBody1)
      .post('/', reqBody2)
      .reply(200, resBody2);

    const user = new User('http://localhost');
    await user.enter();
    await user.tap(/д/i);

    scope.done();
  });

  it('button with extraProps', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse({
      response: {buttons: [
          {title: 'Да'}
        ]}
    });

    const reqBody2 = createRequest({
      session: {new: false, message_id: 2},
      request: {command: 'Да', original_utterance: 'Да', type: 'SimpleUtterance', markup: {dangerous_context: true}}
    });
    const resBody2 = createResponse();

    const scope = nock('http://localhost')
      .post('/', reqBody1)
      .reply(200, resBody1)
      .post('/', reqBody2)
      .reply(200, resBody2);

    const user = new User('http://localhost');
    await user.enter();
    await user.tap('Да', {request: {markup: {dangerous_context: true}}});

    scope.done();
  });

  it('button with extraProps as a function', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse({
      response: {buttons: [
          {title: 'Да'}
        ]}
    });

    const reqBody2 = createRequest({
      session: {new: false, message_id: 2},
      request: {command: 'Да', original_utterance: 'Да', type: 'SimpleUtterance', markup: {dangerous_context: true}}
    });
    const resBody2 = createResponse();

    const scope = nock('http://localhost')
      .post('/', reqBody1)
      .reply(200, resBody1)
      .post('/', reqBody2)
      .reply(200, resBody2);

    const user = new User('http://localhost');
    await user.enter();
    await user.tap('Да', body => body.request.markup = {dangerous_context: true});

    scope.done();
  });

  it('throws for missing buttons', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse();

    nock('http://localhost').post('/', reqBody1).reply(200, resBody1);
    const user = new User('http://localhost');
    await user.enter();
    await assert.rejects(user.tap('Да'), /Предыдущий запрос не вернул ни одной кнопки/);
  });

  it('throw if non matched by title', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse({
      response: {buttons: [
          {title: 'Да'},
          {title: 'Нет'},
        ]}
    });

    nock('http://localhost').post('/', reqBody1).reply(200, resBody1);
    const user = new User('http://localhost');
    await user.enter();
    await assert.rejects(user.tap('Ок'),
      /Кнопка "Ок" не найдена среди возможных кнопок: Да, Нет./
    );
  });

  it('throws if non matched by regexp', async () => {
    const reqBody1 = createEnterRequest();
    const resBody1 = createResponse({
      response: {buttons: [
          {title: 'Да'},
          {title: 'Нет'},
        ]}
    });

    nock('http://localhost').post('/', reqBody1).reply(200, resBody1);
    const user = new User('http://localhost');
    await user.enter();
    await assert.rejects(user.tap(/помощь/i),
      /Кнопка "\/помощь\/i" не найдена среди возможных кнопок: Да, Нет./
    );
  });

  it('navigate to url if button contains url', async () => {
    const reqBody = createEnterRequest();
    const resBody = createResponse({
      response: {buttons: [
          {
            title: 'кнопка',
            url: 'http://localhost'
          },
        ]}
    });

    const scope = nock('http://localhost')
      .post('/', reqBody)
      .reply(200, resBody)
      .get('/')
      .reply(200, 'ok');

    const user = new User('http://localhost');
    await user.enter();
    await user.tap('кнопка');

    scope.done();
    assert.equal(user.body, 'ok');
  });
});

