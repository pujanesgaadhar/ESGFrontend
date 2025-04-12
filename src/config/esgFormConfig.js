export const esgFormConfig = {
  form_title: "Upload ESG & GHG Data",
  fields: [
    {
      label: "Company Name",
      type: "text",
      required: true,
      name: "company_name",
      disabled: true // Will be auto-filled from user's company
    },
    {
      label: "Reporting Period",
      type: "date_range",
      required: true,
      name: "reporting_period",
      startName: "period_start",
      endName: "period_end"
    },
    {
      label: "Industry Type",
      type: "dropdown",
      required: true,
      name: "industry_type",
      options: ["Manufacturing", "IT", "Pharma", "Agriculture", "Textiles", "Chemicals", "Other"]
    },
    {
      label: "Location",
      type: "text",
      required: true,
      name: "location"
    },
    {
      label: "Scope 1 Emissions (Direct)",
      type: "number",
      unit: "kg CO2e",
      required: true,
      name: "scope1_emissions"
    },
    {
      label: "Scope 2 Emissions (Indirect)",
      type: "number",
      unit: "kg CO2e",
      required: true,
      name: "scope2_emissions"
    },
    {
      label: "Scope 3 Emissions (Value Chain)",
      type: "number",
      unit: "kg CO2e",
      required: true,
      name: "scope3_emissions"
    },
    {
      label: "Water Consumption",
      type: "number",
      unit: "liters",
      required: true,
      name: "water_consumption"
    },
    {
      label: "Waste Generated (Total)",
      type: "number",
      unit: "kg",
      required: true,
      name: "total_waste"
    },
    {
      label: "Hazardous Waste",
      type: "number",
      unit: "kg",
      required: false,
      name: "hazardous_waste"
    },
    {
      label: "Non-Hazardous Waste",
      type: "number",
      unit: "kg",
      required: false,
      name: "non_hazardous_waste"
    },
    {
      label: "Recycled Materials Used (%)",
      type: "number",
      required: false,
      name: "recycled_materials_percentage",
      min: 0,
      max: 100
    },
    {
      label: "Employee Count",
      type: "number",
      required: true,
      name: "employee_count",
      min: 0
    },
    {
      label: "Diversity (Women in Workforce %)",
      type: "number",
      required: false,
      name: "women_workforce_percentage",
      min: 0,
      max: 100
    },
    {
      label: "CSR Initiatives Taken",
      type: "textarea",
      required: false,
      name: "csr_initiatives"
    },
    {
      label: "Certifications (ISO, etc.)",
      type: "file_upload",
      required: false,
      name: "certifications",
      acceptedFormats: [".pdf", ".jpg", ".png"]
    },
    {
      label: "Supporting Documents",
      type: "file_upload",
      required: false,
      name: "supporting_documents",
      acceptedFormats: [".pdf", ".xls", ".csv"]
    },
    {
      label: "ESG Policy Document",
      type: "file_upload",
      required: false,
      name: "esg_policy",
      acceptedFormats: [".pdf", ".docx"]
    },
    {
      label: "Declaration",
      type: "checkbox",
      required: true,
      name: "declaration",
      text: "I certify that the above data is accurate and verified."
    }
  ],
  conditional_sections: [
    {
      industry: "Manufacturing",
      fields: [
        { 
          label: "Energy Consumption",
          type: "number",
          unit: "kWh",
          name: "manufacturing_energy_consumption"
        },
        { 
          label: "Raw Material Usage",
          type: "number",
          unit: "tons",
          name: "manufacturing_raw_material"
        },
        { 
          label: "Water Discharged",
          type: "number",
          unit: "liters",
          name: "manufacturing_water_discharged"
        },
        { 
          label: "Number of Production Units",
          type: "number",
          name: "manufacturing_production_units"
        }
      ]
    },
    {
      industry: "IT",
      fields: [
        { 
          label: "Electricity Used in Offices",
          type: "number",
          unit: "kWh",
          name: "it_office_electricity"
        },
        { 
          label: "Data Center Usage",
          type: "number",
          unit: "kWh",
          name: "it_datacenter_usage"
        },
        { 
          label: "Travel-Related Emissions",
          type: "number",
          unit: "kg CO2e",
          name: "it_travel_emissions"
        },
        { 
          label: "E-Waste Generated",
          type: "number",
          unit: "kg",
          name: "it_ewaste"
        }
      ]
    },
    {
      industry: "Agriculture",
      fields: [
        { 
          label: "Fertilizer Usage",
          type: "number",
          unit: "kg",
          name: "agriculture_fertilizer"
        },
        { 
          label: "Methane Emissions",
          type: "number",
          unit: "kg CO2e",
          name: "agriculture_methane"
        },
        { 
          label: "Crop Yield per Hectare",
          type: "number",
          unit: "tons",
          name: "agriculture_crop_yield"
        },
        { 
          label: "Irrigation Water Usage",
          type: "number",
          unit: "liters",
          name: "agriculture_irrigation"
        }
      ]
    },
    {
      industry: "Pharma",
      fields: [
        { 
          label: "Chemical Usage",
          type: "number",
          unit: "liters",
          name: "pharma_chemical_usage"
        },
        { 
          label: "Solvent Emissions",
          type: "number",
          unit: "kg CO2e",
          name: "pharma_solvent_emissions"
        },
        { 
          label: "Incineration Waste",
          type: "number",
          unit: "kg",
          name: "pharma_incineration_waste"
        },
        { 
          label: "Compliance Licenses",
          type: "file_upload",
          acceptedFormats: [".pdf", ".jpg"],
          name: "pharma_compliance_licenses"
        }
      ]
    }
  ]
};
