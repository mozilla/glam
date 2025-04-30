# Adding a Product to GLAM

To add a new product to GLAM, you'll need to:

1. Configire a new ETL DAG
2. Configure new ETL queries
3. Configure the backend API
4. Create a product configuration file in the front-end
5. Update the product registry in the front-end

## 1. New ETL Queries
Follow [Adding a new product to GLAM ETL](https://github.com/mozilla/glam/blob/main/docs/adding-glean-product.md) to properly set up the queries needed for a new product.

## 2. New ETL DAG
Make a copy of an existing DAG in  (such as [glam_fog](https://github.com/mozilla/telemetry-airflow/blob/main/dags/glam_fog.py)) in the [telemetry-airflow project](https://github.com/mozilla/telemetry-airflow/tree/main/dags) and change the configurations for the new product.

## 3. Backend Configuration

### Update API Constants

In `glam/api/constants.py`, add your product to the `PRODUCT_IDS` dictionary:

```python
PRODUCT_IDS = {
    "fog": "Firefox on Glean",
    "fenix": "Fenix",
    "your-product": "Your Product Name",  # Add your product here
}
```

### Update Request Validation

In `glam/api/views.py`, modify the `validate_request_glean` function to include your product in the validation:

```python
def validate_request_glean(**kwargs):
    # ... existing code ...

    if validated_data["product"] not in ["fog", "fenix", "your-product"]:  # Add your product here
        raise ValidationError("Invalid product: {}".format(validated_data["product"]))
```

## 4. Frontend Configuration

### Create Product Configuration File

Create a new file in `src/config/` for your product, e.g., `your-product.js`:

```javascript
import gleanBase from './glean-base';

export default {
  ...gleanBase,
  label: 'Your Product Name',
  key: 'your-product',

  // Override any base configuration as needed
  dimensions: {
    ...gleanBase.dimensions,
    // Add or modify dimensions specific to your product
  },

  // Override probe view mappings if needed
  probeView: {
    ...gleanBase.probeView,
    // Add or modify view mappings specific to your product
  },

  // Override data transformation if needed
  transformProbeForGLAM(probe) {
    // Add any product-specific probe transformations
    return probe;
  },

  // Override store defaults if needed
  setDefaultsForProbe(store) {
    // Add any product-specific default settings
    gleanBase.setDefaultsForProbe(store);
  }
};
```

### Update Product Registry

In `src/config/products.js`, add your product to the registry:

```javascript
import fogConfig from './fog';
import fenixConfig from './fenix';
import yourProductConfig from './your-product';

export default {
  fog: fogConfig,
  fenix: fenixConfig,
  'your-product': yourProductConfig,  // Add your product here
};
```

## 5. Testing

After adding your product:

1. Test the backend API:
   - Verify that requests with your product ID are accepted
   - Check that data is correctly fetched from BigQuery

2. Test the frontend:
   - Verify that your product appears in the product selector
   - Test metric exploration and visualization
   - Verify that all dimensions work as expected
