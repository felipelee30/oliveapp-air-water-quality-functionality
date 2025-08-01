import { Request, Response } from "express";
import { GetEnvironmentalQuality } from "@application/useCases/GetEnvironmentalQuality";

export class EnvironmentalQualityController {
  constructor(
    private readonly getEnvironmentalQualityUseCase: GetEnvironmentalQuality
  ) {}

  async getEnvironmentalQuality(req: Request, res: Response): Promise<void> {
    try {
      console.log(
        "[EnvironmentalQualityController] Received request query:",
        req.query
      );
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        console.log(
          "[EnvironmentalQualityController] Missing lat or lng parameter"
        );
        res.status(400).json({
          error: "Missing required parameters: lat and lng",
        });
        return;
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      console.log(
        `[EnvironmentalQualityController] Parsed coordinates: latitude=${latitude}, longitude=${longitude}`
      );

      if (isNaN(latitude) || isNaN(longitude)) {
        console.log(
          "[EnvironmentalQualityController] Invalid coordinates provided"
        );
        res.status(400).json({
          error: "Invalid coordinates: lat and lng must be valid numbers",
        });
        return;
      }

      console.log(
        "[EnvironmentalQualityController] Calling use case with coordinates:",
        { latitude, longitude }
      );
      const result = await this.getEnvironmentalQualityUseCase.execute({
        latitude,
        longitude,
      });

      console.log("[EnvironmentalQualityController] Use case result:", result);
      res.json(result);
    } catch (error: any) {
      console.error("Environmental quality error:", error);

      if (error.message && error.message.includes("Invalid")) {
        console.log(
          "[EnvironmentalQualityController] Error is invalid input:",
          error.message
        );
        res.status(400).json({
          error: error.message,
        });
      } else {
        console.log(
          "[EnvironmentalQualityController] Internal server error:",
          error.message
        );
        res.status(500).json({
          error: "Failed to fetch environmental quality data",
          message: error.message,
        });
      }
    }
  }
}
