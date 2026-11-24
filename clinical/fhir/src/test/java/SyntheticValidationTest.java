import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.validation.FhirValidator;
import ca.uhn.fhir.validation.ResultSeverityEnum;
import org.hl7.fhir.common.hapi.validation.validator.FhirInstanceValidator;
import org.junit.jupiter.api.Test;
import java.nio.file.Files;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;

public class SyntheticValidationTest {
 @Test void validatesGeneratedFixtures() throws Exception {
  FhirContext ctx=FhirContext.forR4();
  FhirValidator v=ctx.newValidator();
  v.registerValidatorModule(new FhirInstanceValidator(ctx));
  for(int n:new int[]{5,10,20,50}){
   String json=Files.readString(Path.of("generated","cohort-"+n+".json"));
   var result=v.validateWithResult(json);
   long errors=result.getMessages().stream().filter(m->m.getSeverity()==ResultSeverityEnum.ERROR||m.getSeverity()==ResultSeverityEnum.FATAL).count();
   System.out.println("Synthetic cohort "+n+" messages="+result.getMessages().size()+" errors="+errors);
   result.getMessages().forEach(m->System.out.println(m.getSeverity()+" "+m.getLocationString()+" "+m.getMessage()));
   assertTrue(result.isSuccessful(),"Base R4 fixture validation failed for cohort "+n);
  }
  assertFalse(v.validateWithResult("{\"resourceType\":\"Observation\"}").isSuccessful(),"Negative control missing mandatory fields must fail");
 }
}
