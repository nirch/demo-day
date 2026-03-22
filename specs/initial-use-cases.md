Demo Day App


## Description

This app will be used at the demo day of the Full-Stack bootcamp as a tool to rank the teams and decide on the winner. The main users of the app are the judges who give scores for the different demos and finally decide on the winner of the demo day.


## Target Users

- Admin

- Judge

- Viewer


## Use Cases (Per User)

### Viewer

- Accepts an invite to a demo-day event (given a URL)

- Views a summary of the teams and demos

- View demo day results


### Judge

Has all Viewer use cases plus:

- When accepts an invite needs to provide the judge details

- Per demo (team) provides scores on different criterias 

- View a summary of all scores per team

- Decide on a winner


### Admin

Has all Judge use cases plus:

- Create a demo day event with the following information:

  - Product name

  - Product overview

  - Link to live product

  - Members per team

  - Criteria for scores

- Send an invite to a viewer

- Send an invite to a judge

- Remove a judge

- Decide on a winner per demo day
