import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  backArrow: {
    fontSize: 24,
    color: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#000',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  continueButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feelingButton: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingVertical: 15,
    marginVertical: 5,
    alignItems: 'center',
  },
  selectedFeelingButton:{
     borderColor:"#007BFF",
     backgroundColor:"#E6F4FF"
   },
   feelingText:{
     fontSize :16 ,
     color:"#666"
   }, 
   selectedFeelingText:{
     color:"#007BFF"
   }
});

export default styles;
