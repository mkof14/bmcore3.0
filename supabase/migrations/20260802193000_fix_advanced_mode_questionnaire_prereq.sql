-- Fix advanced-mode prerequisite check: count completed section status flags,
-- not the number of questionnaire_responses rows (was always 0 or 1).
CREATE OR REPLACE FUNCTION check_advanced_mode_prerequisites(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required_sections integer := 5;
  v_questionnaires_complete integer := 0;
  v_row questionnaire_responses%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM questionnaire_responses
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  v_questionnaires_complete :=
    (CASE WHEN v_row.categories_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.personal_info_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.medical_history_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.medications_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.allergies_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.vital_signs_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.lifestyle_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.psychological_health_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.mens_sexual_health_status = 'complete' THEN 1 ELSE 0 END) +
    (CASE WHEN v_row.womens_sexual_health_status = 'complete' THEN 1 ELSE 0 END);

  RETURN v_questionnaires_complete >= v_required_sections;
END;
$$;
