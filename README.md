# Dataset builder for job posts

This is the main script that i am using to build a dataset of job posts, this dataset is used to train a model that can predict if an item is a job post or not.

Run this script by executing the following command:

This will scrap href's from the url and open a text editor where you can mark what is a job ad, This will save to a sqlite database.

```bash
node index.js {url}
```

Add a `-b` or `--browsing` so that you can browse to the correct page first, this is useful when scraping pages behind a login or that you can not directly access

Where `{url}` is the url of the page that contains the job posts.

This should bring up a sublime text file of all the links on that page as a pipe delimited CSV file

Add columns to the end of each line, if necessary.

jobTitle, jobLocation




