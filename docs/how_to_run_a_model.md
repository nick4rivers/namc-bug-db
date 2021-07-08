---
title: How to Run a Model
---

This document outlines how to run a model using the new NAMC database system. It describes all the steps including calculating predictors and metrics, running the actual model and then storing the results back in the database.

# Step 1 Preparation 

## 1.1 Obtain the latest model code

TODO: describe cloning or pulling the latest model code from GitHub.

## 1.2 Identify Your Project or Box

Models can be run on a collection of samples that are associated with either
a box or project. If you don't already have a project defined, you can use
R to create one and then associate one or more samples with the project before attempting to run a model.

# Step 2

The following steps are described as individual processes, when in reality
they are best performed in a single R script. Cut, paste and tweak the following R statements to build the script in question.

## 2.1 Obtain a list of Samples

Use the following R statement to call the API and retrieve a dataframe containing the list of samples for your box or project

```R
samples = NAMCr::query('samples', projectId=XXXX)
```

Or for a box:

```R
samples = NAMCr::query('samples', boxId=XXXX)
```

## 2.2 Calculate Predictors

Loop over each of the samples and ensure that the predictors are calculated and up to date. There are two types of predictors, "sample predictors" that are specific to the date of a particular sample, and "site predictors" that are pertain to the sample site location and do not vary over time. 

The following API call will return all the predictors for a particular sample and model, along with their status. The status can be one of three values:

* valid - the predictor value exists and is up to date (i.e. the value was calculated after the latest change ot the sample date and/or the site location and site catchment were specified.)
* expired - the predictor value exists but it is older than the latest change to either the sample date and/or the site location and catchment.
* missing - the predictor value does not exist in the database.

```R
model_predictors = NAMCr::query('modelPredictors', modelName='AREMP')
predictors = NAMCr::query('samplePredictorValues', sampleId=p_sample_id)
```

## 2.3 Calculate Metrics

Metrics are calculated at the database and available via the API. Note that the metrics API endpoint includes the rarefied taxa that were used during metric calculation. This is returned as part of the metrics data so that the same rarefaction can be used for running the model as were used in metric calculation.


```R
metrics = NAMCr::query('sampleMetrics', translationId=model::fixedCount, fixedCount=model::fixedCount, sampleIds=samples)
```

## 2.4 Run the Model

Run the actual model by passing the taxa retrieved during the previous step, along with the metrics and predictors.

```R
results = model:code_function(taxa, metrics, predictors)
```

## 2.5 Store the Model Results in the Database

The model result, along with the rarefaction are then stored in the database.

```R
NAMCr::save('setModelResult', rarefiedTaxa=taxa, modelResult=results::value, modelVersion=model::verison)
```

## Verify the Results

You should verify that the model results were successfully store in the database.

```R
check_results = NAMCr::query('modelResults', sampleIds=samples::sampleId)
```
