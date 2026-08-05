import { asyncHandler } from "../../middleware/errorHandler.js";
import * as SurveysService from "./surveys.service.js";

export const submitSurvey = asyncHandler(async (req, res) => {
  const survey = await SurveysService.submitSurvey(req.user.farmer.id, req.body);
  res.status(201).json(survey);
});

export const getMySurvey = asyncHandler(async (req, res) => {
  const survey = await SurveysService.getMySurvey(req.user.farmer.id);
  if (!survey) return res.status(404).json({ error: "No survey submitted yet" });
  res.json(survey);
});

export const getAllSurveys = asyncHandler(async (req, res) => {
  const { district, group } = req.query;
  const surveys = await SurveysService.getAllSurveys({ district, group });
  res.json(surveys);
});

export const getGroupBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await SurveysService.getGroupBreakdown();
  res.json(breakdown);
});