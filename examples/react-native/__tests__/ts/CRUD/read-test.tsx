import React from 'react';
import {View, Text} from 'react-native';
import {render, waitFor} from '@testing-library/react-native';
import Realm from 'realm';
import {createRealmContext} from '@realm/react';
import Person from '../Models/Person';
import Task from '../Models/Task';

const realmConfig = {
  schema: [Person, Task],
  deleteRealmIfMigrationNeeded: true,
};

const {RealmProvider, useObject, useQuery} = createRealmContext(realmConfig);

let assertionRealm: Realm;

describe('Read Data Tests', () => {
  beforeEach(async () => {
    // we will use this Realm for assertions to access Realm Objects outside of a Functional Component (like required by @realm/react)
    assertionRealm = await Realm.open(realmConfig);

    // delete every object in the realmConfig in the Realm to make test idempotent
    assertionRealm.write(() => {
      assertionRealm.delete(assertionRealm.objects('Person'));
      assertionRealm.delete(assertionRealm.objects('Task'));

      const annieObj = new Person(assertionRealm, {name: 'Annie', age: 54});
      const bobObj = new Person(assertionRealm, {name: 'Bob', age: 29});

      new Task(assertionRealm, {
        _id: 142339,
        name: 'Wash the dishes',
        priority: 3,
        progressMinutes: 5,
        assignee: annieObj,
      });

      // high priority, high progress
      new Task(assertionRealm, {
        _id: 204191,
        name: 'Do the laundry',
        priority: 4,
        progressMinutes: 30,
        assignee: annieObj,
      });

      // low priority, low progress
      new Task(assertionRealm, {
        _id: 214810,
        name: 'Gym Workout',
        priority: 3,
        progressMinutes: 7,
        assignee: bobObj,
      });
    });
  });
  afterAll(() => {
    if (!assertionRealm.isClosed) {
      assertionRealm.close();
    }
  });

  it('should read from a realm', async () => {
    // :snippet-start: crud-read-object-by-id
    // :replace-start: {
    //  "terms": {
    //   " testID='task-item-sentence'": ""
    //   }
    // }
    const TaskItem = ({_id}: {_id: number}) => {
      const myTask = useObject(Task, _id);
      return (
        <View>
          {myTask ? (
            <Text testID='task-item-sentence'>
              {myTask.name} is a task with the priority of: {myTask.priority}
            </Text>
          ) : null}
        </View>
      );
    };
    // :replace-end:
    //:snippet-end:

    const App = () => (
      <RealmProvider>
        <TaskItem _id={142339} />{' '}
      </RealmProvider>
    );
    const {getByTestId} = render(<App />);

    // test that the 'useObject()' method worked and the correct sentence is rendered as expected
    const taskItemSentence = await waitFor(
      () => getByTestId('task-item-sentence'),
      {timeout: 5000},
    );
    expect(taskItemSentence.props.children.join('')).toBe(
      'Wash the dishes is a task with the priority of: 3',
    );
  });

  it('should filter data', async () => {
    // :snippet-start: crud-read-filter-data
    // :replace-start: {
    //  "terms": {
    //   " testID='high-priority-element'": "",
    //   " testID='low-progress-element'": ""
    //   }
    // }
    const TaskList = () => {
      // retrieve the set of Task objects
      const tasks = useQuery(Task);

      // filter for tasks with a high priority
      const highPriorityTasks = tasks.filtered('priority >= 4');

      // filter for tasks that have just-started or short-running progress
      const lowProgressTasks = tasks.filtered(
        '1 <= progressMinutes && progressMinutes < 10',
      );

      return (
        <>
          <Text>Your high priority tasks:</Text>
          {highPriorityTasks.map(taskItem => {
            return <Text testID='high-priority-element'>{taskItem.name}</Text>;
          })}
          <Text>Your tasks without much progress:</Text>
          {lowProgressTasks.map(taskItem => {
            return <Text testID='low-progress-element'>{taskItem.name}</Text>;
          })}
        </>
      );
    };
    // :replace-end:
    // :snippet-end:

    const App = () => (
      <RealmProvider>
        <TaskList />
      </RealmProvider>
    );
    const {getAllByTestId} = render(<App />);

    // test that the highPriorityTasks items Text renders
    const highPriorityTasksUIList = await waitFor(
      () => getAllByTestId('high-priority-element'),
      {timeout: 5000},
    );
    expect(highPriorityTasksUIList[0].children[0].toString()).toBe(
      'Do the laundry',
    ); // Since only the 'Do the laundry' task is high priority

    // test that the highPriorityTasks items Text renders
    const lowProgressTasksUIList = await waitFor(
      () => getAllByTestId('low-progress-element'),
      {timeout: 5000},
    );
    // test that both 'Wash the dishes' and 'Gym Workout' rendered because they are both low progress tasks
    expect(lowProgressTasksUIList[0].children[0].toString()).toBe(
      'Wash the dishes',
    );
    expect(lowProgressTasksUIList[1].children[0].toString()).toBe(
      'Gym Workout',
    );
  });

  it('should render sorted tasks', async () => {
    // :snippet-start: crud-read-sort-data
    // :replace-start: {
    //  "terms": {
    //   " testID='all-tasks-item'": "",
    //   " testID='tasks-by-name-item'": "",
    //   " testID='tasks-by-name-descending-item'": "",
    //   " testID='tasks-by-priority-descending-and-name-item'": "",
    //   " testID='tasks-by-assignee-name-item'": ""
    //   }
    // }
    const TaskList = () => {
      // retrieve the set of Task objects
      const tasks = useQuery(Task);
      // Sort tasks by name in ascending order
      const tasksByName = tasks.sorted('name');
      // Sort tasks by name in descending order
      const tasksByNameDescending = tasks.sorted('name', true);
      // Sort tasks by priority in descending order and then by name alphabetically
      const tasksByPriorityDescendingAndName = tasks.sorted([
        ['priority', true],
        ['name', false],
      ]);
      // Sort Tasks by Assignee's name.
      const tasksByAssigneeName = tasks.sorted('assignee.name');

      return (
        <>
          <Text>All tasks:</Text>
          {tasks.map(task => (
            <Text testID='all-tasks-item'>{task.name}</Text>
          ))}

          <Text>Tasks sorted by name:</Text>
          {tasksByName.map(task => (
            <Text testID='tasks-by-name-item'>{task.name}</Text>
          ))}

          <Text>Tasks sorted by name descending:</Text>
          {tasksByNameDescending.map(task => (
            <Text testID='tasks-by-name-descending-item'>{task.name}</Text>
          ))}

          <Text>
            Tasks sorted by priority descending, and name alphabetically:
          </Text>
          {tasksByPriorityDescendingAndName.map(task => (
            <Text testID='tasks-by-priority-descending-and-name-item'>
              {task.name}
            </Text>
          ))}

          <Text>Tasks sorted by assignee name:</Text>
          {tasksByAssigneeName.map(task => (
            <Text testID='tasks-by-assignee-name-item'>{task.name}</Text>
          ))}
        </>
      );
    };
    // :replace-end:
    // :snippet-end:

    const App = () => (
      <RealmProvider>
        <TaskList />
      </RealmProvider>
    );
    const {getAllByTestId} = render(<App />);

    // test that tasks should be in the order that they were written
    const allTasksUIList = await waitFor(
      () => getAllByTestId('all-tasks-item'),
      {timeout: 5000},
    );
    expect(allTasksUIList[0].children[0].toString()).toBe('Wash the dishes');
    expect(allTasksUIList[1].children[0].toString()).toBe('Do the laundry');
    expect(allTasksUIList[2].children[0].toString()).toBe('Gym Workout');

    // test that tasksByName should be in alphabetical name order
    const taskByNameUIList = await waitFor(
      () => getAllByTestId('tasks-by-name-item'),
      {timeout: 5000},
    );
    expect(taskByNameUIList[0].children[0].toString()).toBe('Do the laundry');
    expect(taskByNameUIList[1].children[0].toString()).toBe('Gym Workout');
    expect(taskByNameUIList[2].children[0].toString()).toBe('Wash the dishes');

    // test that tasksByNameDescending should be in reverse alphabetical name order
    const taskByNameDescendingUIList = await waitFor(
      () => getAllByTestId('tasks-by-name-descending-item'),
      {timeout: 5000},
    );
    expect(taskByNameDescendingUIList[0].children[0].toString()).toBe(
      'Wash the dishes',
    );
    expect(taskByNameDescendingUIList[1].children[0].toString()).toBe(
      'Gym Workout',
    );
    expect(taskByNameDescendingUIList[2].children[0].toString()).toBe(
      'Do the laundry',
    );

    // test that tasksByNameDescending should be in reverse alphabetical name order
    const tasksByPriorityDescendingAndNameUIList = await waitFor(
      () => getAllByTestId('tasks-by-priority-descending-and-name-item'),
      {timeout: 5000},
    );
    expect(
      tasksByPriorityDescendingAndNameUIList[0].children[0].toString(),
    ).toBe('Do the laundry');
    expect(
      tasksByPriorityDescendingAndNameUIList[1].children[0].toString(),
    ).toBe('Gym Workout');
    expect(
      tasksByPriorityDescendingAndNameUIList[2].children[0].toString(),
    ).toBe('Wash the dishes');

    // test that tasksByNameDescending should be in reverse alphabetical name order
    const tasksByAssigneeNameUIList = await waitFor(
      () => getAllByTestId('tasks-by-assignee-name-item'),
      {timeout: 5000},
    );
    expect(tasksByAssigneeNameUIList[0].children[0].toString()).toBe(
      'Wash the dishes',
    );
    expect(tasksByAssigneeNameUIList[1].children[0].toString()).toBe(
      'Do the laundry',
    );
    expect(tasksByAssigneeNameUIList[2].children[0].toString()).toBe(
      'Gym Workout',
    );
  });
});
