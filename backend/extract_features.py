from numpy import pi

def planet_volume(radius):
    planet_vol_earth = (4/3) * pi * (radius ** 3)

    EARTH_VOLUME_KM3 = 1.08321e12

    planet_volume_km3 = planet_vol_earth * EARTH_VOLUME_KM3

    return planet_volume_km3

def star_volume(radius):
    star_vol_solar = (4/3) * pi * (radius ** 3)

    SOLAR_VOLUME_KM3 = 1.412e18

    star_volume_km3 = star_vol_solar * SOLAR_VOLUME_KM3

    return star_volume_km3

def explain_disposition(planet_row , prediction):
    """
    Generates a human-readable explanation for a planet's disposition based on its flags.
    Args:
        planet_row (pd.Series): A single row from the raw Kepler dataframe.
    Returns:
        str: The formatted explanation string.
    """
    disposition = prediction
    kepoi_name = planet_row['kepoi_name']
    explanation = f"Explanation for {kepoi_name} (Disposition: {disposition}):\n"

    if disposition == 'Exoplanet':
        explanation += ("This signal is a confirmed exoplanet. It has successfully passed all automated "
                        "and manual vetting checks, showing no signs of being a false positive.")
        return explanation

    if disposition == 'FALSE POSITIVE':
        reasons = []
        if planet_row.get('koi_fpflag_nt', 0) == 1:
            reasons.append("the signal's light curve was not transit-like in shape")
        if planet_row.get('koi_fpflag_ss', 0) == 1:
            reasons.append("the source of the transit signal is offset from the target star, suggesting a background star (stellar scintillation)")
        if planet_row.get('koi_fpflag_co', 0) == 1:
            reasons.append("the center-of-light for the target star shifted during the transit, indicating the source is a nearby star (centroid offset)")
        if planet_row.get('koi_fpflag_ec', 0) == 1:
            reasons.append("the light curve's shape is characteristic of an eclipsing binary star system")

        if not reasons:
            explanation += ("This signal is a false positive. While no primary flags were raised in this dataset, "
                            "it was identified as non-planetary through other vetting procedures.")
        else:
            explanation += f"This signal is a false positive because {', and '.join(reasons)}."
        return explanation

    return f"ℹ️ The status of {kepoi_name} is '{disposition}', which is pending further analysis."