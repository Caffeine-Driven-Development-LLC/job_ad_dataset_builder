# Dataset builder for job posts

This is the main script that i am using to build a dataset of job posts, this dataset is used to train a model that can predict if an item is a job post or not.

Run this script by executing the following command:

```bash
node index.js {url}
```

Where `{url}` is the url of the page that contains the job posts.

This should bring up a sublime text file of all the links on that page as a pipe delimited CSV file

Add columns to the end of each line, if necessary.

jobTitle, jobLocation



